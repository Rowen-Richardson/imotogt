import { toast } from "@/hooks/use-toast"

export function handleSupabaseError(error: any): string {
  if (!error) return "An unknown error occurred"

  // Auth errors
  if (error.message?.includes("Invalid login credentials")) {
    return "Invalid email or password"
  }
  if (error.message?.includes("Email not confirmed")) {
    return "Please check your email and click the confirmation link"
  }
  if (error.message?.includes("User already registered")) {
    return "An account with this email already exists"
  }
  if (error.message?.includes("Password should be at least")) {
    return "Password must be at least 6 characters long"
  }
  if (error.message?.includes("JWT") || error.message?.includes("does not exist")) {
    return "Session expired. Please sign in again."
  }
  if (error.message?.includes("Database error saving new user")) {
    return "Account created but profile setup failed. Please try signing in."
  }

  // Database errors
  if (error.code === "PGRST116") {
    return "Record not found"
  }
  if (error.code === "23505") {
    return "This record already exists"
  }

  // Storage errors
  if (error.message?.includes("The resource was not found") || error.message?.includes("Bucket not found")) {
    return "File not found or bucket misconfigured."
  }
  if (error.message?.includes("The object exceeded the maximum allowed size")) {
    return "File is too large"
  }
  if (error.message?.includes("violates row-level security policy")) {
    return "Permission denied. You may need to re-authenticate to perform this action."
  }

  // Return original message
  return error.message || "An unexpected error occurred"
}

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class NetworkError extends AppError {
  constructor(message = "Network error occurred") {
    super(message, "NETWORK_ERROR", 0)
    this.name = "NetworkError"
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    public field?: string,
  ) {
    super(message, "VALIDATION_ERROR", 400)
    this.name = "ValidationError"
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, "UNAUTHORIZED", 401)
    this.name = "UnauthorizedError"
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, "NOT_FOUND", 404)
    this.name = "NotFoundError"
  }
}

export class ServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, "SERVER_ERROR", 500)
    this.name = "ServerError"
  }
}

export const errorHandler = {
  /**
   * Handle and display errors to the user
   */
  handle(error: unknown, context?: string) {
    console.error(`Error in ${context || "application"}:`, error)

    let message = "An unexpected error occurred"
    let title = "Error"

    if (error instanceof AppError) {
      message = error.message

      switch (error.constructor.name) {
        case "NetworkError":
          title = "Connection Error"
          message = "Please check your internet connection and try again"
          break
        case "ValidationError":
          title = "Validation Error"
          break
        case "UnauthorizedError":
          title = "Access Denied"
          message = "Please log in to continue"
          break
        case "NotFoundError":
          title = "Not Found"
          break
        case "ServerError":
          title = "Server Error"
          message = "Something went wrong on our end. Please try again later"
          break
      }
    } else if (error instanceof Error) {
      message = error.message
    }

    // Only show toast if we're in the browser
    if (typeof window !== "undefined") {
      toast({
        title,
        description: message,
        variant: "destructive",
      })
    }
  },

  /**
   * Handle API response errors
   */
  async handleApiResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData.error || errorData.message || `HTTP ${response.status}`

      switch (response.status) {
        case 400:
          throw new ValidationError(message)
        case 401:
          throw new UnauthorizedError(message)
        case 404:
          throw new NotFoundError(message)
        case 500:
          throw new ServerError(message)
        default:
          throw new AppError(message, `HTTP_${response.status}`, response.status)
      }
    }

    return response
  },

  /**
   * Wrap async functions with error handling
   */
  withErrorHandling<T extends (...args: any[]) => Promise<any>>(fn: T, context?: string): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args)
      } catch (error) {
        this.handle(error, context)
        throw error
      }
    }) as T
  },

  /**
   * Create a safe async function that doesn't throw
   */
  safe<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: string,
  ): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null> {
    return async (...args: Parameters<T>) => {
      try {
        return await fn(...args)
      } catch (error) {
        this.handle(error, context)
        return null
      }
    }
  },
}

// Global error boundary for unhandled promise rejections
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason)
    errorHandler.handle(event.reason, "unhandled promise rejection")
  })

  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error)
    errorHandler.handle(event.error, "global error")
  })
}

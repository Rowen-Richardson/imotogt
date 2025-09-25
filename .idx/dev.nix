nix
{
  outputs = { nixpkgs }: {
    # Firebase Studio preview configuration
    preview = {
      root = ./.;
      command = [ "${nixpkgs.nodejs_20}/bin/node" "node_modules/.bin/next" "dev" ]; # Adjust command as needed for your project
      port = 3000; # Adjust port if your application runs on a different port
      env = { }; # Add any necessary environment variables
      language = "Nodejs";
      
      # Define the dependencies for the preview environment
      packages = with nixpkgs; [
        nodejs_20
      ];
    };
  };
}
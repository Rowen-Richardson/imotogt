nix
{
  description = "Development environment for a Node.js project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { nixpkgs }: {
    devshells.default = with nixpkgs; mkShell {
      packages = [
        nodejs_20
      ];

      shellHook = ''
        # Add any shell-specific commands here
        echo "Entering Node.js development shell"
      '';
    };

    # Devcontainer feature configuration
    devcontainerFeature = {
      name = "nodejs-20";
      version = "1.0.0";
      description = "Installs Node.js 20";
      options = {
        nodeVersion = {
          type = "string";
          default = "20";
          description = "Node.js version to install";
        };
      };
      install = ''
        #!/bin/bash
        set -euo pipefail

        NODE_VERSION=${NODE_VERSION:-20}

        echo "Installing Node.js version ${NODE_VERSION}..."

        # Install Node.js using Nix
        ${nixpkgs.nix} profile install nixpkgs#nodejs_$NODE_VERSION

        echo "Node.js ${NODE_VERSION} installed."
      '';
    };

    # Firebase Studio preview configuration
    preview = {
      root = ./.;
      command = [ "pnpm" "run" "dev" ]; # Adjust command as needed for your project
      port = 3000; # Adjust port if your application runs on a different port
      env = { }; # Add any necessary environment variables
      language = "Nodejs";
    };
  };
}
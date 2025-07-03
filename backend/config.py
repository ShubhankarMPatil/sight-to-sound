import torch

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Capture settings
CAPTURE_INTERVAL = 3  # seconds between caption generations
import os
import time
import requests
import logging
from dotenv import load_dotenv

# --- Configuration ---
# Load environment variables from .env file if it exists (for local development)
# In a production environment (e.g., Docker, Kubernetes), these would be injected directly.
load_dotenv()

# Configure logging for better visibility in production and development
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# E-commerce Storefront API base URL
# This is where the inventory updates will be sent.
STOREFRONT_API_BASE_URL = os.getenv('STOREFRONT_API_BASE_URL', 'http://localhost:5000/api')

# API key for authenticating with the storefront backend.
# Essential for secure service-to-service communication.
STOREFRONT_API_KEY = os.getenv('STOREFRONT_API_KEY')

# External inventory source URL (e.g., an ERP system, supplier API, or another microservice).
# This is where the current inventory data is fetched from.
# Example: Could be a dedicated 'Inventory Management Service' in a larger microservice architecture.
EXTERNAL_INVENTORY_SOURCE_URL = os.getenv('EXTERNAL_INVENTORY_SOURCE_URL', 'http://mock-erp-inventory.com/api/products/inventory')

# Synchronization interval in seconds. Defines how often the sync process runs.
SYNC_INTERVAL_SECONDS = int(os.getenv('INVENTORY_SYNC_INTERVAL_SECONDS', 300)) # Default to 5 minutes

# --- Helper Functions ---

def get_auth_headers():
    """
    Returns authentication headers for API requests to the storefront backend.
    Uses an X-API-Key for simple service-to-service authentication.
    """
    if not STOREFRONT_API_KEY:
        logging.warning("STOREFRONT_API_KEY is not set. API requests to storefront might fail due to lack of authentication.")
        return {'Content-Type': 'application/json'}
    return {'X-API-Key': STOREFRONT_API_KEY, 'Content-Type': 'application/json'}

def fetch_external_inventory():
    """
    Fetches inventory data from the configured external source.
    This function simulates fetching data from an external system (e.g., an ERP,
    a supplier's API, or a dedicated inventory microservice).
    """
    logging.info(f"Attempting to fetch inventory from external source: {EXTERNAL_INVENTORY_SOURCE_URL}")
    try:
        # In a real-world scenario, this would involve specific API calls,
        # potentially different authentication mechanisms (OAuth, JWT),
        # and data parsing based on the external system's documentation.
        response = requests.get(EXTERNAL_INVENTORY_SOURCE_URL, timeout=15)
        response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)
        external_data = response.json()
        logging.info(f"Successfully fetched {len(external_data)} items from external inventory.")
        return external_data
    except requests.exceptions.Timeout:
        logging.error(f"Timeout occurred while fetching external inventory from {EXTERNAL_INVENTORY_SOURCE_URL}.")
        return None
    except requests.exceptions.ConnectionError as e:
        logging.error(f"Connection error while fetching external inventory: {e}. Is the external service running?")
        return None
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching external inventory: {e}")
        if hasattr(e, 'response') and e.response is not None:
            logging.error(f"External API Error Response: {e.response.text}")
        return None
    except ValueError as e:
        logging.error(f"Error parsing external inventory JSON response: {e}")
        return None

def transform_inventory_data(external_data):
    """
    Transforms the raw external inventory data into a standardized format
    expected by the E-commerce Storefront's API.
    This is a critical step for integrating disparate systems.
    """
    if not external_data:
        logging.info("No external data provided for transformation.")
        return []

    transformed_items = []
    for item in external_data:
        try:
            # Example transformation: Map external fields to internal fields.
            # The keys ('productId', 'sku', 'quantity', 'price') must match
            # what the Node.js backend's /products/sync-inventory endpoint expects.
            transformed_items.append({
                'productId': item.get('external_id'), # Unique identifier for the product
                'sku': item.get('sku'),               # Stock Keeping Unit
                'quantity': item.get('stock_level'),  # Current stock level
                'price': item.get('unit_price'),      # Price (optional, could be a separate sync)
                'lastUpdatedExternal': item.get('last_modified_timestamp') # Timestamp from external system
            })
        except KeyError as e:
            logging.warning(f"Skipping item due to missing critical key in external data: {e} - Item: {item}")
        except Exception as e:
            logging.error(f"Error transforming item {item.get('external_id', 'N/A')}: {e}", exc_info=True)
    return transformed_items

def update_storefront_inventory(inventory_updates):
    """
    Sends the transformed inventory updates to the E-commerce Storefront's backend API.
    """
    if not inventory_updates:
        logging.info("No inventory updates to send to storefront.")
        return True # Considered successful if nothing needed to be sent

    sync_endpoint = f"{STOREFRONT_API_BASE_URL}/products/sync-inventory"
    headers = get_auth_headers()

    logging.info(f"Sending {len(inventory_updates)} inventory updates to storefront: {sync_endpoint}")
    try:
        # The Node.js backend should have an endpoint configured to receive this payload
        # and update its product inventory accordingly.
        response = requests.post(sync_endpoint, json={'updates': inventory_updates}, headers=headers, timeout=30)
        response.
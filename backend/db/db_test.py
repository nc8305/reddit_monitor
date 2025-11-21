import psycopg2
# Change Line 2 to:
from backend.config.env_settings import env_settings

def get_db_connection():
    try:
      connection = psycopg2.connect(
        user=env_settings.DB_USER,
        password=env_settings.DB_PASSWORD,
        host=env_settings.DB_HOST,
        port=env_settings.DB_PORT,
        dbname=env_settings.DB_NAME,
        # sslmode="require"
      )
      # connection = psycopg2.connect(env_settings.CONNECT_URI)
      cursor = connection.cursor()
      
      print("Connection successful")
      # Example query
      cursor.execute("SELECT NOW();")
      result = cursor.fetchone()
      print("Current Time:", result)

      # Close the cursor and connection
      cursor.close()
      connection.close()
      print("Connection closed.")
    except Exception as e:
      print(f"Failed to connect: {e}")

if __name__ == "__main__":
    get_db_connection()
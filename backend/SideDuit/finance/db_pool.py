import os
from psycopg2 import pool
from django.conf import settings

# Global connection pool
_connection_pool = None

def get_connection_pool():
    """
    Get or create a connection pool for Supabase.
    Connection pooling significantly improves performance by reusing connections.
    """
    global _connection_pool
    
    if _connection_pool is None:
        db_password = os.getenv("SUPABASE_DB_PASSWORD")
        if not db_password:
            raise ValueError("SUPABASE_DB_PASSWORD environment variable not set")
            
        host = os.getenv("SUPABASE_DB_HOST", "aws-1-ap-northeast-2.pooler.supabase.com")
        dbname = "postgres"
        user = os.getenv("SUPABASE_DB_USER", "postgres.owlqezrqhwnhviwirsvs")
        port = "5432"
        
        # Create a connection pool with min 2, max 10 connections
        _connection_pool = pool.ThreadedConnectionPool(
            minconn=2,
            maxconn=10,
            host=host,
            database=dbname,
            user=user,
            password=db_password,
            port=port
        )
    
    return _connection_pool

def get_db_connection():
    """Get a connection from the pool"""
    pool = get_connection_pool()
    return pool.getconn()

def release_db_connection(conn):
    """Return a connection to the pool"""
    pool = get_connection_pool()
    pool.putconn(conn)

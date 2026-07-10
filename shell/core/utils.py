import os

def find_in_path(cmd_name):
    """
    Unified helper to search for an executable in the system's PATH.
    """
    pwd = os.environ.get('PATH', '').split(":")
    for directory in pwd:
        if not directory:
            continue
        full_path = os.path.join(directory, cmd_name)
        if os.path.isfile(full_path) and os.access(full_path, os.X_OK):
            return full_path
    return None

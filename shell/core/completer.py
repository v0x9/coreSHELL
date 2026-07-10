import os
import sys
import readline

commands = ["echo", "exit"]
last_was_ambiguous = False
last_text = ""

def longest_common_prefix(matches):
    if not matches:
        return ""

    min_len = min(len(s) for s in matches)
    prefix = ""

    for i in range(min_len):
        ch = matches[0][i]

        for s in matches:
            if s[i] != ch:
                return prefix

        prefix += ch

    return prefix

def get_executables(prefix):
    matches = set()
    paths = os.environ.get("PATH", "").split(":")

    for p in paths:
        try:
            for name in os.listdir(p):
                if name.startswith(prefix):
                    full = os.path.join(p, name)
                    if os.access(full, os.X_OK) and not os.path.isdir(full):
                        matches.add(name)
        except FileNotFoundError:
            pass

    return sorted(matches)

def completer(text, state):
    global last_was_ambiguous, last_text
    cmd_matches = commands
    if state == 0:
        cmd_matches = [c for c in commands if c.startswith(text)]
        exe_matches = get_executables(text)
        matches = cmd_matches + exe_matches
        matches = sorted(set(matches))
        if not matches:
            last_was_ambiguous = False
            return None

        if len(matches) == 1:
            last_was_ambiguous = False
            return matches[0] + " "
        if last_was_ambiguous and last_text == text:
            print()
            print("  ".join(matches))
            print("$ " + readline.get_line_buffer(), end="", flush=True)
            last_was_ambiguous = False
        else:
            lcp = longest_common_prefix(matches)
            if len(lcp) > len(text):
               return lcp  
            
            sys.stdout.write("\x07")
            sys.stdout.flush()
            last_was_ambiguous = True
            last_text = text

        return None

    return None

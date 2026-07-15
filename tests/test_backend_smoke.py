from pathlib import Path
import ast


def test_backend_server_has_valid_python_syntax():
    server_path = Path(__file__).resolve().parents[1] / "backend" / "server.py"
    source = server_path.read_text(encoding="utf-8")
    ast.parse(source)
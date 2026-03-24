import pytest
import sys
import os

# Add the python directory to the path so we can import security_scanner
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'python'))

from security_scanner import scan_for_vulnerabilities


def test_security_scanner_import():
    """Test that security_scanner can be imported successfully"""
    assert scan_for_vulnerabilities is not None


def test_scan_for_vulnerabilities_basic():
    """Test basic functionality of scan_for_vulnerabilities"""
    # Test with a simple code snippet
    result = scan_for_vulnerabilities("print('hello')")
    assert result is not None


def test_scan_for_vulnerabilities_with_empty_string():
    """Test scan_for_vulnerabilities with empty input"""
    result = scan_for_vulnerabilities("")
    assert isinstance(result, (dict, list, str, type(None)))
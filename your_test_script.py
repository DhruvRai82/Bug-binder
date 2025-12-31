#!/usr/bin/env python3
"""
Sample Python Selenium Test Script for Visual Test Runner
This script demonstrates a basic Selenium test that runs in a visible browser.
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import sys
import time

def run_test():
    """Run a sample Selenium test"""
    driver = None
    
    try:
        print("[INFO] Initializing Chrome WebDriver...")
        
        # Configure Chrome options for visible browser
        chrome_options = Options()
        # DO NOT use headless mode - we want to see the browser
        # chrome_options.add_argument('--headless')
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        
        # Initialize the WebDriver
        driver = webdriver.Chrome(options=chrome_options)
        
        print("[INFO] Navigating to test page...")
        driver.get("https://www.google.com")
        
        # Wait for page to load
        wait = WebDriverWait(driver, 10)
        
        print("[INFO] Waiting for search box...")
        search_box = wait.until(
            EC.presence_of_element_located((By.NAME, "q"))
        )
        
        print("[INFO] Typing search query...")
        search_box.send_keys("Selenium WebDriver")
        time.sleep(1)  # Visual delay to see the typing
        
        print("[INFO] Submitting search...")
        search_box.submit()
        
        print("[INFO] Waiting for results...")
        wait.until(
            EC.presence_of_element_located((By.ID, "search"))
        )
        
        time.sleep(2)  # Keep browser open for visual confirmation
        
        print("[SUCCESS] Test completed successfully!")
        return 0
        
    except Exception as e:
        print(f"[ERROR] Test failed: {str(e)}")
        return 1
        
    finally:
        if driver:
            print("[INFO] Closing browser...")
            time.sleep(1)  # Brief pause before closing
            driver.quit()

if __name__ == "__main__":
    exit_code = run_test()
    sys.exit(exit_code)

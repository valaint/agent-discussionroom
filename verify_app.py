from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Go to app
            page.goto("http://localhost:5173")

            # Wait for loaded
            page.wait_for_selector('text=Rooms')

            # Click plus icon to create room
            page.locator('button:has(.lucide-plus)').click()

            # Wait for room to be created and selected
            page.wait_for_selector('text=Room 1')

            # Send a message
            input_box = page.locator('input[placeholder="Type a message or command..."]')
            input_box.fill("Implement a test function")
            page.locator('button:has-text("Send")').click()

            # Wait for a mock response (agents take 1-3 seconds)
            time.sleep(4)

            # Take a screenshot
            page.screenshot(path="verification.png", full_page=True)
            print("Screenshot taken successfully")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()

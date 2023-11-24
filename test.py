from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import constants

options = Options()
options.headless = True
driver = webdriver.Chrome(executable_path=constants.DRIVER_PATH, options=options)
driver = webdriver.Chrome()
driver.get("https://www.google.com")
time.sleep(5)

driver.close()
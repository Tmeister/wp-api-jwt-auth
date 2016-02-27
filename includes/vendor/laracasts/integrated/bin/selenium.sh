#!/usr/bin/env sh

# First:
# Install PhantomJS: brew install phantomjs198
# Install Selenium Stand-Alone Server: http://selenium-release.storage.googleapis.com/index.html?path=2.45/

phantomjs --webdriver=4444 &
java -jar selenium-server-standalone-2.45.0.jar
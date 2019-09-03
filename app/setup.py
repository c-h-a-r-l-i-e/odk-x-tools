#!/usr/bin/python3
import sys
from openpyxl import load_workbook
import os

def getApps():
    apps = ["setup\apps\{}".format(app) for app in os.listdir("setup\apps")]
    return apps

def installApps():
    for app in getApps():
        os.system("adb install {}".format(app))

if __name__ == "__main__":
    installApps()
    os.system("grunt --gruntfile designerFiles\Gruntfile.js clean")

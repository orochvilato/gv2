# -*- coding: utf-8 -*-
from genvisu import app,memcache
from genvisu.tools import json_response,image_response,getdot,maj1l
import requests
from selenium import webdriver
from selenium.webdriver.chrome import service
from PIL import Image,ImageChops,ImageFont,ImageDraw
from string import Template
import StringIO
import datetime
import time
import re
import tempfile
import os
from io import BytesIO



def savepage(url,size,key):
    import time
    from selenium import webdriver



    options = webdriver.ChromeOptions()
    options.binary_location = '/usr/bin/google-chrome'
    options.add_argument('headless')
    options.add_argument('window-size=%sx%s' % (size[0],size[1]+100))
    cdservice = service.Service('/usr/bin/chromedriver')
    memcache.set(key,{'etat':u'génération du visuel','avancement':20})
    cdservice.start()
    driver = webdriver.Chrome(chrome_options=options)
    memcache.set(key,{'etat':u'génération du visuel','avancement':30})

    driver.get(url);
    memcache.set(key,{'etat':u'génération du visuel','avancement':40})
    #time.sleep(5) # Let the user actually see something!

    for i in range(3):
        time.sleep(1)
        memcache.set(key,{'etat':u'génération du visuel','avancement':60+i*10})

    im = Image.open(StringIO.StringIO(driver.get_screenshot_as_png()))
    im2 = im.crop((0,0,size[0],size[1]))
    driver.quit()
    cdservice.stop()
    output = StringIO.StringIO()
    im2.save(output,'PNG')
    memcache.set(key,{'etat':u'génération du visuel','avancement':100})
    return output.getvalue()

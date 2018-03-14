#-*- coding: utf-8 -*-
from genvisu import app,app_path

import os.path
import json
import datetime

def liste_visuels(domaine):
    path = os.path.join(app_path,'genvisu','modeles',domaine)
    if os.path.exists(path):
        for fname in os.listdir(path):
            ppath = os.path.join(path,fname,'preview.png')
            if os.path.exists(ppath):
                pass

def check_previews():
    path = os.path.join(app_path,'genvisu','modeles')
    saves = {}
    if os.path.exists(path):
        for fname in os.listdir(path):
            if fname[-5:]=='.json':
                filepath = os.path.join(path,fname)
                with open(filepath,'r') as f:
                    saves[fname[:-5]] = f.readline()[:-1]
    return saves

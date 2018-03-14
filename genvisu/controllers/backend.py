#-*- coding: utf-8 -*-
from genvisu import app,app_path

import os.path
import json
import datetime

def load_saves(userid):
    path = os.path.join(app_path,'data','save',userid)
    saves = {}
    if os.path.exists(path):
        for fname in os.listdir(path):
            if fname[-5:]=='.json':
                filepath = os.path.join(path,fname)
                with open(filepath,'r') as f:
                    saves[fname[:-5]] = f.readline()[:-1]
    return saves

def save_work(userid,slot,data):

    path = os.path.join(app_path,'data','save',userid)
    if not os.path.exists(path):
        os.makedirs(path)
    visuel = data.get('visuel')
    with open(os.path.join(path,slot+'.json'),'w') as f:
        f.write('%s (%s)\n' % (visuel,datetime.datetime.now().strftime('%d/%m/%Y %H:%M')))
        f.write(json.dumps(data.get('data')))

def load_work(userid,slot):
    path = os.path.join(app_path,'data','save',userid,slot+'.json')

    if os.path.exists(path):

        import json
        with open(path) as f:
            visuel = f.readline().split(' (')[0]
            load = json.loads(f.read())

        return visuel,load
    return None,None


def save_snapshot(userid,workname,data):
    path = os.path.join(app_path,'data','save',userid)
    if not os.path.exists(path):
        os.makedirs(path)
    import json
    with open(os.path.join(path,workname+'.png'),'w') as f:
        f.write(data)

def load_snapshot(userid,workname):
    path = os.path.join(app_path,'data','save',userid,workname+'.png')

    if not os.path.exists(path):
        path = os.path.join(app_path,'data','vide.png')
    import json
    with open(path) as f:
        load = f.read()
    return load






#-save_id
#-visuel_id
#-json

'''
I want to serve my own tiles
'''
import os
import urllib.request
import multiprocessing

tileserver = 'http://a.tile.openstreetmap.org/'
base = os.path.dirname(__file__)

def download_one(x, y, z):
    url = f"{tileserver}/{z}/{x}/{y}.png"
    dirs = f"{base}/tiles/{z}/{x}/"
    os.makedirs(dirs, exist_ok=True)
    path = f"{base}/tiles/{z}/{x}/{y}.png"
    if not os.path.exists(path):
        urllib.request.urlretrieve(url, path)

pool = multiprocessing.Pool(4)
def download_around(z, xmin, ymin, d=0):
    args = [(x,y,z) for x in range(xmin, xmin+d) for y in range(ymin, ymin+d)]
    pool.starmap(download_one, args)

for i in range(5):
    download_around(12+i, 1209*2**i, 1463*2**i, 4*2**i)

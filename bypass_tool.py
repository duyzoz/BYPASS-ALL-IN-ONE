#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Bypass Short Link All-in-One Tool
Tác giả: Nguyễn Mạnh Hiếu (Hiếu Dz)
Repo: https://github.com/Nguoibianhz/Bypass-Short-Link
"""

import requests
import re
import time
import random
import base64
import urllib.parse
from urllib.parse import urlparse
import subprocess
import sys

class BypassTool:
    def __init__(self):
        self.rod = random.randint(100000, 999999)
        self.rad = str(self.rod)
        self.unix_time = int(time.time())
        
    def banner(self):
        print("=" * 60)
        print("    BYPASS SHORT LINK ALL-IN-ONE TOOL")
        print("    Tác giả: Nguyễn Mạnh Hiếu (Hiếu Dz)")
        print("    Repo: https://github.com/Nguoibianhz/Bypass-Short-Link")
        print("=" * 60)
        print("\nCác mode hỗ trợ:")
        print("1. YeuMoney - Bypass các nhiệm vụ YeuMoney")
        print("2. Link4M - Bypass các link traffic Link4M")
        print("3. FunLink - Bypass link FunLink.io")
        print("4. LinkTot - Bypass link LinkTot.net")
        print("5. Link4Sub - Bypass link Link4Sub.com")
        print("6. LaymaNet - Bypass link LayMa.net")
        print("=" * 60)

    def auto_install(self, *packages):
        """Tự động cài đặt packages nếu thiếu"""
        for package in packages:
            try:
                __import__(package)
            except ImportError:
                print(f">> Installing: {package}")
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
                __import__(package)

    def yeumoney_bypass(self):
        """Bypass YeuMoney tasks"""
        print("\n=== YEUMONEY BYPASS ===")
        print('Vui lòng chờ 80s trước khi nhập mã vào Yeumoney')
        
        task_types = {
            'm88': {'url': 'https://bet88ec.com/cach-danh-bai-sam-loc', 'domain': 'https://bet88ec.com/', 'code': 'taodeptrai'},
            'fb88': {'url': 'https://fb88dq.com/cach-choi-ca-cuoc-golf', 'domain': 'https://fb88dq.com/', 'code': 'taodeptrai'},
            '188bet': {'url': 'https://88betag.com/cach-choi-game-bai-pok-deng', 'domain': 'https://88betag.com/', 'code': 'taodeptrailamnhe'},
            'w88': {'url': 'https://165.22.63.250/soi-keo-tottenham-vs-crystal-palace-02-03-2024', 'domain': 'https://165.22.63.250/', 'code': 'taodeptrai'},
            'v9bet': {'url': 'https://v9betho.com/ca-cuoc-bong-ro-ao', 'domain': 'https://v9betho.com/', 'code': 'taodeptrai'},
            'vn88': {'url': 'https://vn88sv.com/cach-choi-bai-gao-gae', 'domain': 'https://vn88sv.com/', 'code': 'bomaydeptrai'},
            'bk8': {'url': 'https://bk8ze.com/cach-choi-bai-catte', 'domain': 'https://bk8ze.com/', 'code': 'taodeptrai'},
            'w88xlm': {'url': 'https://w88xlm.com/cach-choi-bai-solitaire', 'domain': 'https://w88xlm.com/', 'code': 'taodeptrai'}
        }
        
        direct_types = {
            '88betag': {'url': 'https://88betag.com/keo-chau-a-la-gi', 'domain': 'https://88betag.com/', 'code': 'bomaylavua'},
            'w88abc': {'url': 'https://w88abc.com/cach-choi-ca-cuoc-lien-quan-mobile', 'domain': 'https://w88abc.com/', 'code': 'bomaylavua'},
            'v9betlg': {'url': 'https://v9betlg.com/phuong-phap-cuoc-flat-betting', 'domain': 'https://v9betlg.com/', 'code': 'bomaylavua'},
            'bk8xo': {'url': 'https://bk8xo.com/lo-ba-cang-la-gi', 'domain': 'https://bk8xo.com/', 'code': 'bomaylavua'},
            'vn88ie': {'url': 'https://vn88ie.com/cach-nuoi-lo-khung', 'domain': 'https://vn88ie.com/', 'code': 'bomaylavua'}
        }
        
        print("Các loại nhiệm vụ:")
        for key in list(task_types.keys()) + list(direct_types.keys()):
            print(f"- {key}")
        
        task_type = input('\nChọn loại nhiệm vụ: ').strip().lower()
        
        if task_type in task_types:
            config = task_types[task_type]
            print(f"Đang gửi request đến: https://traffic-user.net/GET_MA.php")
            print(f"Với tham số: codexn={config['code']}, url={config['url']}")
            
            try:
                response = requests.post(f'https://traffic-user.net/GET_MA.php?codexn={config["code"]}&url={config["url"]}&loai_traffic={config["domain"]}&clk=1000', timeout=30)
                print(f"Response status: {response.status_code}")
                
                if response.status_code != 200:
                    print(f"Lỗi HTTP: {response.status_code}")
                    print("Response text:", response.text[:500])
                    return
                    
                html = response.text
                print(f"Response length: {len(html)} characters")
                
                # Debug: In ra một phần response để kiểm tra
                if len(html) < 1000:
                    print("Full response:", html)
                else:
                    print("Response preview:", html[:500] + "...")
                
                # Thử nhiều pattern khác nhau
                patterns = [
                    r'<span id="layma_me_vuatraffic"[^>]*>\s*(\d+)\s*</span>',
                    r'layma_me_vuatraffic[^>]*>\s*(\d+)\s*<',
                    r'(\d{4,8})',  # Tìm số có 4-8 chữ số
                ]
                
                match = None
                for i, pattern in enumerate(patterns):
                    match = re.search(pattern, html)
                    if match:
                        print(f"Found match with pattern {i+1}: {match.group(1)}")
                        break
                
            except requests.exceptions.Timeout:
                print("Request timeout - server có thể đang chậm")
                return
            except requests.exceptions.RequestException as e:
                print(f"Request error: {e}")
                return
                
        elif task_type in direct_types:
            config = direct_types[task_type]
            print(f"Đang gửi request đến: https://traffic-user.net/GET_MD.php")
            print(f"Với tham số: codexnd={config['code']}, url={config['url']}")
            
            try:
                response = requests.post(f'https://traffic-user.net/GET_MD.php?codexnd={config["code"]}&url={config["url"]}&loai_traffic={config["domain"]}&clk=1000', timeout=30)
                print(f"Response status: {response.status_code}")
                
                if response.status_code != 200:
                    print(f"Lỗi HTTP: {response.status_code}")
                    return
                    
                html = response.text
                print(f"Response length: {len(html)} characters")
                
                # Debug: In ra một phần response
                if len(html) < 1000:
                    print("Full response:", html)
                else:
                    print("Response preview:", html[:500] + "...")
                
                # Thử nhiều pattern
                patterns = [
                    r'<span id="layma_me_tfudirect"[^>]*>\s*(\d+)\s*</span>',
                    r'layma_me_tfudirect[^>]*>\s*(\d+)\s*<',
                    r'(\d{4,8})',
                ]
                
                match = None
                for i, pattern in enumerate(patterns):
                    match = re.search(pattern, html)
                    if match:
                        print(f"Found match with pattern {i+1}: {match.group(1)}")
                        break
                        
            except requests.exceptions.Timeout:
                print("Request timeout - server có thể đang chậm")
                return
            except requests.exceptions.RequestException as e:
                print(f"Request error: {e}")
                return
        else:
            print('Vui lòng chọn đúng lựa chọn')
            return
            
        if match:
            code = match.group(1)
            print(f"✅ Mã: {code}")
        else:
            print("❌ Không tìm thấy mã trong response")
            print("Có thể server đang bảo trì hoặc đã thay đổi format response")

    def link4m_bypass(self):
        """Bypass Link4M tasks"""
        print("\n=== LINK4M BYPASS ===")
        
        # Danh sách các URL và config
        url_configs = {
            'https://soikeo.uk.com/': {'key': 'u0cLg', 'path': '/', 'service': 'https://s1.what-on.com/widget/service.js'},
            'https://xosodientu.com/': {'key': 'sdgQhQny', 'path': '/', 'service': 'https://s1.what-on.com/widget/service.js'},
            'https://hutbephotvietphat.vn/hut-be-phot-tai-hoa-binh-uy-tin-gia-re-0947-888-198-bid21.html': {'key': 'U8022T1', 'path': '/hut-be-phot-tai-hoa-binh-uy-tin-gia-re-0947-888-198-bid21.html', 'service': 'https://s1.what-on.com/widget/service.js'},
            'https://fitting.us.com/': {'key': 'gLaiBZ', 'path': '/', 'service': 'https://s1.what-on.com/widget/service.js'},
            'https://www.bape-shirt.us.com/': {'key': 'UfeQFHhb', 'path': '/', 'service': 'https://s1.what-on.com/widget/service.js'},
            'https://dienlanh61.com/': {'key': 'YjQKK7', 'path': '/', 'service': 'https://s1.what-on.com/widget/service-v2.js'},
            'https://88aas.com/': {'key': 'fJn539c7', 'path': '/', 'service': 'https://s1.what-on.com/widget/service.js'}
        }
        
        url = input('Nhập URL nhiệm vụ: ').strip()
        
        # Normalize URL
        for test_url in url_configs.keys():
            if url in [test_url, test_url.replace('https://', ''), test_url.replace('https://', 'http://'), test_url.replace('https://www.', ''), test_url.replace('https://www.', 'www.')]:
                config = url_configs[test_url]
                break
        else:
            print("URL không được hỗ trợ!")
            return
            
        headers = {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'referer': test_url,
            'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
        }

        params = {'key': config['key']}
        response = requests.get(config['service'], params=params, headers=headers)
        
        if response.status_code == 200:
            js = response.text
            pattern = r'var\s+(\w+)\s*=\s*(["\'])(.*?)\2\s*;'
            matches = re.findall(pattern, js)

            def decode(s):
                return bytes(s, "utf-8").decode("unicode_escape")

            traffic_key = traffic_id = traffic_domain = traffic_session = uuid_name = None

            for name, _, value in matches:
                if name == "traffic_key":
                    traffic_key = decode(value)
                elif name == "traffic_id":
                    traffic_id = decode(value)
                elif name == "traffic_domain":
                    traffic_domain = decode(value)
                elif name == "traffic_session":
                    traffic_session = decode(value)
                elif name == "uuid_name":
                    uuid_name = decode(value)
                    
            print('Please wait 90 seconds...')
            time.sleep(90)
            
            params = {
                'code': traffic_id,
                'traffic_session': traffic_session,
                'screen': '1000 x 1000',
                'browser': 'Skibidi',
                'browserVersion': '100',
                'browserMajorVersion': '100',
                'mobile': 'false',
                'os': 'SkibidiOS',
                'osVersion': '5',
                'cookies': 'true',
                'flashVersion': 'no check',
                'lang': 'en-US',
                'client_id': traffic_session,
                'pathname': config['path'],
                'href': test_url,
                'hostname': test_url,
            }
            
            aresponse = requests.get('https://s1.what-on.com/widget/get_code.html', params=params, headers=headers)
            if aresponse.status_code == 200:
                print(aresponse.json())
            else:
                print('Không thể load JS hoặc request không thành công')
        else:
            print("Không thể load JS hoặc request không thành công")

    def funlink_bypass(self):
        """Bypass FunLink.io"""
        print("\n=== FUNLINK BYPASS ===")
        
        url = input('Enter URL: ').strip()
        
        def getlink(dot, ids, id, type):
            headers = {
                'accept': 'application/json',
                'accept-language': 'en-US,en;q=0.9',
                'content-type': 'application/json',
                'origin': 'https://funlink.io',
                'priority': 'u=1, i',
                'referer': 'https://funlink.io/',
                'rid': self.rad,
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
            }

            json_data = {
                'browser_name': 'skibidu',
                'browser_version': '99999',
                'os_name': 'SkibidiOS',
                'os_version': '10000',
                'os_version_name': '1000',
                'keyword_answer': dot,
                'link_shorten_id': id,
                'keyword': type,
                'ip': '',
                'user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
                'device_name': 'desktop',
                'token': '',
                'keyword_id': ids,
            }

            response = requests.post('https://public.funlink.io/api/url/tracking-url', headers=headers, json=json_data)

            if response.status_code == 200:
                dtt = response.json()
                return dtt["data_link"]['url']
            else:
                return 'err'

        urlmatch = re.search(r"funlink\.io/([A-Za-z0-9]+)", url)
        if not urlmatch:
            print('Đã có lỗi xảy ra khi fetch id, vui lòng kiểm tra lại URL')
            return
            
        id = urlmatch.group(1)
        
        headers = {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'origin': 'https://funlink.io',
            'priority': 'u=1, i',
            'referer': 'https://funlink.io/',
            'rid': self.rad,
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
        }
        
        params = {'ignoreId': self.rad, 'id': id}
        response = requests.get('https://public.funlink.io/api/code/renew-key', params=params, headers=headers)
        
        if response.status_code != 200:
            print('Đã có lỗi xảy ra khi Bypass, get support')
            return
            
        dt = response.json()
        if not dt:
            print('no response for step 1')
            return
            
        urls = dt["data_keyword"]["url_destination"]
        ids = dt["data_keyword"]["id"]
        type = dt["data_keyword"]["keyword_text"]
        aurls = f'{urls}404'

        fheaders = {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'max-age=0',
            'origin': urls,
            'priority': 'u=1, i',
            'referer': urls,
            'rid': self.rad,
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
        }
        
        fresponse = requests.options('https://public.funlink.io/api/code/ch', headers=fheaders)
        if fresponse.status_code != 200:
            print('Đã có lỗi xảy ra khi Bypass')
            return
            
        time.sleep(60)
        
        headers = {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'max-age=0',
            'content-type': 'application/json',
            'origin': urls,
            'priority': 'u=1, i',
            'referer': urls,
            'rid': self.rad,
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
        }
        
        json_data = {
            'screen': '1000 x 800',
            'browser_name': 'Safari',
            'browser_version': '100.0.0.0',
            'browser_major_version': '137',
            'is_mobile': False,
            'os_name': 'skibidiOS',
            'os_version': '10000000',
            'is_cookies': True,
            'href': aurls,
            'user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
            'hostname': urls,
        }
        
        response = requests.post('https://public.funlink.io/api/code/code', headers=headers, json=json_data)

        if response.status_code == 200:
            dat = response.json()
            code = getlink(dat['code'], ids, id, type)
            if code == 'err':
                print('Đã có lỗi xảy ra khi Bypass, contact support')
            else:
                print(f'Code: {code}')
        else:
            print('Đã có lỗi xảy ra khi Bypass')

    def linktot_bypass(self):
        """Bypass LinkTot.net"""
        print("\n=== LINKTOT BYPASS ===")
        
        url = input('Enter quest url: ').strip()
        lurl = input('Enter Linktot url: ').strip()
        type = input('Enter quest type (normal/backlink/changecolor): ').strip()
        
        if type == 'normal':
            headers = {
                'origin': url,
                'referer': url,
                'rid': self.rad,
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15',
            }
            response = requests.options('https://linktot.net/ping.php', headers=headers)
        elif type == 'backlink':
            headers = {
                'origin': url,
                'referer': url,
                'rid': self.rad,
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15',
            }
            response = requests.options('https://linktot.net/ping_backlink.php', headers=headers)
        else:
            print('Type không hỗ trợ')
            return
            
        print('Pending...')
        if response.status_code != 200:
            print('Không thành công')
            return
            
        time.sleep(80)
        
        gheaders = {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'max-age=0',
            'content-type': 'application/json',
            'origin': url,
            'priority': 'u=1, i',
            'ref': url,
            'referer': url,
            'rid': self.rad,
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15',
        }

        gjson_data = {
            'href': url,
            'hostname': url,
        }

        gresponse = requests.post('https://linktot.net/get-code.php', headers=gheaders, json=gjson_data)
        if gresponse.status_code == 200:
            gjson = gresponse.json()
            enstring = gjson['code']
            K_Dilink = "1ThDrStTr"

            decoded_base64 = base64.b64decode(enstring).decode('utf-8')

            decrypted_string = ""
            for i in range(len(decoded_base64)):
                decrypted_string += chr(ord(decoded_base64[i]) ^ ord(K_Dilink[i % len(K_Dilink)]))

            print("Giải mã được: ", decrypted_string)
        else:
            print('Không thành công')

    def link4sub_bypass(self):
        """Bypass Link4Sub.com"""
        print("\n=== LINK4SUB BYPASS ===")
        print('Vui lòng nhập url gốc dưới dạng "https://link4sub.com/abc123"')
        
        def match_url(url):
            if not url.startswith("http"):
                url = "https://" + url
            parsed = urlparse(url)
            path = parsed.path.strip("/")
            match = re.match(r'^([\w\-]+)$', path)
            if match:
                return match.group(1)
            return None

        def extract_link(json_data):
            encoded_url = json_data['data']['data']['lnk']['lnk1']['url']
            try:
                decoded_url = urllib.parse.unquote(base64.b64decode(encoded_url).decode('utf-8'))
                return decoded_url
            except Exception as e:
                raise Exception(f'Failed to decode URL: {e}')
                
        url = input('Vui lòng nhập url: ').strip()
        scode = match_url(url)
        if not scode:
            print('URL không hợp lệ')
            return
            
        response = requests.get(f'https://link4sub.com/stu/{scode}/fetch-data')
        if response.status_code == 200:
            data = response.json()
            try:
                links = extract_link(data)
                print(f'Link đích: {links}')
            except Exception as e:
                print(f'Error fetching links: {e}')
        else:
            print(f"Failed to fetch data: {response.status_code}")

    def laymanet_bypass(self):
        """Bypass LayMa.net"""
        print("\n=== LAYMANET BYPASS ===")
        
        url_configs = {
            'https://bamivapharma.com/': {'code': 'e9VJokISt'},
            'https://suamatzenmilk.com/': {'code': 'viyjUHvaj'},
            'https://china-airline.net/': {'code': 'oTedsZr2m', 'hurl': 'https://enzymevietnam.com/'},
            'https://scarmagic-gm.com/': {'code': 'e9VJokISt', 'hurl': 'https://bamivapharma.com/'}
        }
        
        eurl = input('Nhập url nhiệm vụ: ').strip()
        platform = input('Nhập platform (facebook/google): ').strip().lower()
        
        # Normalize platform
        if platform in ['facebook', 'fb', 'meta']:
            platform = 'facebook'
        elif platform in ['google', 'gg', 'g']:
            platform = 'google'
        else:
            print('Platform không hỗ trợ')
            return
        
        # Find config
        config = None
        for test_url in url_configs:
            if eurl in [test_url, test_url.replace('https://', ''), test_url.replace('https://', 'http://'), test_url.replace('/', '')]:
                config = url_configs[test_url]
                hurl = config.get('hurl', test_url)
                break
        
        if not config:
            print('URL không được hỗ trợ')
            return

        headers = {
            'Host': 'layma.net',
            'Accept-Language': 'en-GB,en;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
            'Referer': hurl,
            'Connection': 'keep-alive',
        }

        response = requests.get(f'https://layma.net/Traffic/Index/{config["code"]}', headers=headers)
        if response.status_code != 200:
            print('Lỗi khi lấy data, vui lòng báo cáo admin')
            return

        sheaders = {
            'Host': 'api.layma.net',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
            'Accept': '*/*',
            'Origin': hurl,
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': hurl,
            'Priority': 'u=1, i',
        }
        
        sparams = {
            'keytoken': config['code'],
            'flatform': platform,
        }
        
        sresponse = requests.get('https://api.layma.net/api/admin/campain', params=sparams, headers=sheaders)
        if sresponse.status_code != 200:
            print('Lỗi khi lấy data, vui lòng báo cáo admin')
            return
            
        html = sresponse.json()
        
        theaders = {
            'Host': 'api.layma.net',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
            'Accept': '*/*',
            'Origin': hurl,
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': hurl,
            'Priority': 'u=1, i',
        }

        tjson_data = {
            'uuid': self.rad,
            'browser': 'Chrome',
            'browserVersion': '100',
            'browserMajorVersion': 100,
            'cookies': True,
            'mobile': False,
            'os': 'OS',
            'osVersion': '5',
            'screen': '1000 x 1000',
            'referrer': hurl,
            'trafficid': html['id'],
            'solution': '1',
        }

        tresponse = requests.post('https://api.layma.net/api/admin/codemanager/getcode', headers=theaders, json=tjson_data)
        if tresponse.status_code == 200:
            th = tresponse.json()
            print(f'Mã: {th["html"]}')
        else:
            print('Lỗi khi lấy data, vui lòng báo cáo admin')

    def run(self):
        """Main function to run the tool"""
        self.banner()
        
        while True:
            try:
                choice = input("\nChọn mode (1-6) hoặc 0 để thoát: ").strip()
                
                if choice == '0':
                    print("Cảm ơn bạn đã sử dụng tool!")
                    break
                elif choice == '1':
                    self.yeumoney_bypass()
                elif choice == '2':
                    self.link4m_bypass()
                elif choice == '3':
                    self.funlink_bypass()
                elif choice == '4':
                    self.linktot_bypass()
                elif choice == '5':
                    self.link4sub_bypass()
                elif choice == '6':
                    self.laymanet_bypass()
                else:
                    print("Lựa chọn không hợp lệ! Vui lòng chọn từ 0-6.")
                    
                # Ask if user wants to continue
                continue_choice = input("\nBạn có muốn tiếp tục? (y/n): ").strip().lower()
                if continue_choice not in ['y', 'yes', 'có']:
                    print("Cảm ơn bạn đã sử dụng tool!")
                    break
                    
            except KeyboardInterrupt:
                print("\n\nThoát chương trình...")
                break
            except Exception as e:
                print(f"Đã xảy ra lỗi: {str(e)}")
                continue


def main():
    """Entry point"""
    try:
        tool = BypassTool()
        tool.run()
    except KeyboardInterrupt:
        print("\n\nThoát chương trình...")
    except Exception as e:
        print(f"Lỗi khởi tạo tool: {str(e)}")


if __name__ == "__main__":
    main()
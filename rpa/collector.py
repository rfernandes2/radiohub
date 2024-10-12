import json
import requests
from secrets import url

class Collector():
    def __init__(self):
        self.url = url
        if self.url == '':
            print('Failed to get Url')
            exit()

    def send_request(self, url):
        try:
            print(f'Sending request to %s' % url)
            response = requests.get(url)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error sending request: {e}")
            return None
    
    def get_countries(self):
        # Get all countries
        self.endpoint = '/countries'
        url = f'{self.url}{self.endpoint}'
        
        response_data = self.send_request(url)

        if not response_data:
            print('Failed to get countries')
            return []

        country_names = []

        for country in response_data:
            country_name = country.get('name')
            if country_name:
                print(country_name)
                country_names.append(country_name)

        return country_names

    def get_station_by_country(self, country):
        url = f'{self.url}/stations/bycountry/{country}'
        stations = self.send_request(url)

        if not stations:
            print('Failed to get radios')
            return []

        filtered_stations = []

        for station in stations:
            filtered_station = {
                "name": station.get("name"),
                "url": station.get("url"),
                "favicon": station.get("favicon")
            }

            filtered_stations.append(filtered_station)

        return filtered_station
    
collector = Collector()
countries = collector.get_countries()

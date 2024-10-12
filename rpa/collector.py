import os
import json
import time
import requests
from secrets import url


SLEEP = 120

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
            if(response.status_code != 200):
                print('Request HTTP code is not 200')
                print(f'Sleeping for {SLEEP} seconds')
                time.sleep(SLEEP)
                return self.send_request(url)
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
                country_names.append(country_name)
                self.get_station_by_country(country_name)

    # Method to get stations by country
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

        self.create_country_stations(country, filtered_stations)

        return filtered_stations

    def create_country_stations(self, country, stations):
        print(f'Creating JSON file for {country}...')

        base_folder = 'radios'
        if not os.path.exists(base_folder):
            os.makedirs(base_folder)

        file_name = country.replace(" ", "_")
        file_path = os.path.join(base_folder, f'{file_name}.json')
        
        with open(file_path, 'w') as json_file:
            json.dump(stations, json_file, indent=4)

        print(f'Stations for {country} saved in {file_path}')

collector = Collector()
collector.get_countries()

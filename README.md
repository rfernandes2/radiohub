# ReadMe

To run:
```
npm install
npm start
```
# What is radiohub
Radio hub is a project that allows the user to listen to multiple radios from multiple contries.
The user can select a contry and shows all radios available from the selected country.

This radios are retrieved by the rpa script that sends multiple requests to the API for all available contries and creates a JSON file for each country with the respective radios.

# Repository structure

* file-server -> API that returns radios to front-end 
* radio-hub -> Front-End for radiohub 
* rpa -> Scripts that gets all radios

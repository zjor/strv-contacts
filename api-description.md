==Registration==
	curl -X POST -H "Content-Type: application/json" http://127.0.0.1:5000/accounts -d "{\"email\":\"zjor.se@gmail.com\", \"password\": \"s3cr3t\"}" -v
	heroku: curl -X POST -H "Content-Type: application/json" https://young-dusk-8108.herokuapp.com/accounts -d "{\"email\":\"zjor.se@gmail.com\", \"password\": \"s3cr3t\"}" -v

==Authentication==
	curl "http://127.0.0.1:5000/access_token?email=zjor.se@gmail.com&password=s3cr3t" -v
	heroku: curl "https://young-dusk-8108.herokuapp.com/access_token?email=zjor.se@gmail.com&password=s3cr3t" -v

==Create and fetch contacts==
	curl -X POST -H "Content-Type: application/json" "http://127.0.0.1:5000/contacts?access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Inpqb3Iuc2VAZ21haWwuY29tIiwicGFzc3dvcmQiOiJzM2NyM3QifQ.utAyPF5u95d3ONM-ezN_ZsU5_szHAXwobVvsnW6-pJk" -d '{"firstName": "Bob", "lastName": "Marley", "phone": "1-321-452-049"}' -v
	curl "http://127.0.0.1:5000/contacts?access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Inpqb3Iuc2VAZ21haWwuY29tIiwicGFzc3dvcmQiOiJzM2NyM3QifQ.utAyPF5u95d3ONM-ezN_ZsU5_szHAXwobVvsnW6-pJk" -v

	heroku: curl -X POST -H "Content-Type: application/json" "https://young-dusk-8108.herokuapp.com/contacts?access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Inpqb3Iuc2VAZ21haWwuY29tIiwicGFzc3dvcmQiOiJzM2NyM3QifQ.utAyPF5u95d3ONM-ezN_ZsU5_szHAXwobVvsnW6-pJk" -d '{"firstName": "Dan", "lastName": "Millman", "phone": "1-800-200-654"}' -v
	heroku: curl "https://young-dusk-8108.herokuapp.com/contacts?access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Inpqb3Iuc2VAZ21haWwuY29tIiwicGFzc3dvcmQiOiJzM2NyM3QifQ.utAyPF5u95d3ONM-ezN_ZsU5_szHAXwobVvsnW6-pJk" -v

==Upload photo==
	curl -F "file=@face.jpg" "http://127.0.0.1:5000/photos?contactId=-Jdhk78PtNQYggF9s5Zz&access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Inpqb3Iuc2VAZ21haWwuY29tIiwicGFzc3dvcmQiOiJzM2NyM3QifQ.utAyPF5u95d3ONM-ezN_ZsU5_szHAXwobVvsnW6-pJk" -v
	heroku: curl -F "file=@face.jpg" "https://young-dusk-8108.herokuapp.com/photos?contactId=-JdhfuOdmMfDSsAilhjj&access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Inpqb3Iuc2VAZ21haWwuY29tIiwicGFzc3dvcmQiOiJzM2NyM3QifQ.utAyPF5u95d3ONM-ezN_ZsU5_szHAXwobVvsnW6-pJk" -v


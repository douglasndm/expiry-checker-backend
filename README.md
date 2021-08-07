You need a Postgres and Redis database for this project.

I suggest using it with docker with the following commands.

docker run --name postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
docker run --name redis -p 6379:6379 -d redis:alpine

And you need to fill the file "src/Config/Firebase/ServiceAccountKey.json" with file from Firebase. More info in https://firebase.google.com/docs/admin/setup

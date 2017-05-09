var config = {
    ENV_NAME: 'production',
    mongo_db: {
       host: "cluster0-shard-00-00-4vv1j.mongodb.net:27017,cluster0-shard-00-01-4vv1j.mongodb.net:27017,cluster0-shard-00-02-4vv1j.mongodb.net:27017",
       database: 'vistayoDbProd',
       username: 'tirtha15',
       password: 'dbAdmin4app',
       queryParams: 'ssl=true&replicaSet=Cluster0-shard-0&authSource=admin'
    },
    elasticsearch: {
        host: 'localhost:9200'
    }
};

config.mongo_db.uri = "mongodb://" + config.mongo_db.username + ":"+ config.mongo_db.password + "@" + config.mongo_db.host + "/" + config.mongo_db.database + "?"+ config.mongo_db.queryParams;

module.exports = config;
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
 
export const RepoPackages = new Mongo.Collection('repoPackages');
export const Repositories = new Mongo.Collection('repositories');


FlowRouter.route('/', {
  name: 'home',
  action() {
    console.log("home");
    BlazeLayout.render('SearchRepository');
  }
});


FlowRouter.route('/topPackages', {
  name: 'topPackages',
  action() {
    console.log("topPackages");
    BlazeLayout.render('TopPackages');
  }
});


if(Meteor.isServer) {
    Meteor.publish('repoPackages', function repoPackagesPublication() {
        return RepoPackages.find();
    });

    Meteor.publish('getTopPackages',function topPackagesPublication(){
        return RepoPackages.aggregate([{"$group" : {_id:"$package", count:{$sum:1}}},{$sort:{"count":-1}}]);
    });

    Meteor.publish('repositories',function(){
        return Repositories.find();
    });
}
 

Meteor.methods({
    'repositories.insert'(name,url,description,stars,owner,default_branch){
        Repositories.insert({'name':name,'url':url,'description':description,'stars':stars,'owner':owner,'default_branch':default_branch});
    },
    'packages.insert'(devDependencies,dependencies,owner,name,default_branch,stars) {
        console.log("before inserting");
        console.log(devDependencies,dependencies,owner,name,default_branch);

        if(dependencies){
            Object.keys(dependencies).forEach(function(key){
                console.log(key);
                if(RepoPackages.findOne({'package':key})){
                    var respositories = RepoPackages.findOne({'package':key}).respositories;
                    respositories.push(name);
                    var count = RepoPackages.findOne({'package':key}).count;
                    count = count+1;
                    RepoPackages.update({'package':key},{$set:{'count':count,'respositories':respositories}});
                }
                else{
                    var respositories = [];
                    respositories.push(name);
                    RepoPackages.insert({'owner':owner,'name':name,'default_branch':default_branch,'package':key,'stars':stars,count:1,respositories:respositories});
                }
                // RepoPackages.insert({'owner':owner,'name':name,'default_branch':default_branch,'package':key,'stars':stars});
            });
        }
        if(devDependencies){
            Object.keys(devDependencies).forEach(function(key){
                console.log(key);
                if(RepoPackages.findOne({'package':key})){
                    var respositories = RepoPackages.findOne({'package':key}).respositories;
                    respositories.push(name);
                    var count = RepoPackages.findOne({'package':key}).count;
                    count = count+1;
                    RepoPackages.update({'package':key},{$set:{'count':count,'respositories':respositories}});

                }
                else{
                    var respositories = [];
                    respositories.push(name);
                    RepoPackages.insert({'owner':owner,'name':name,'default_branch':default_branch,'package':key,'stars':stars,count:1,respositories:respositories});
                }
                // RepoPackages.insert({'owner':owner,'name':name,'default_branch':default_branch,'package':key,'stars':stars});
            });
        }
    },
    'getTopPackages'(){
        
        return RepoPackages.find({},{sort:{count:-1},limit:10}).fetch();
      },
      'getTopRepositories'(){
        return Repositories.find({},{sort:{stars:-1},limit:10}).fetch();
      }
});
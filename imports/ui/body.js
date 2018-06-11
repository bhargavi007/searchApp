import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
 
import {RepoPackages} from '../api/data.js'
import {Repositories} from '../api/data.js'

import './body.html';

Template.SearchRepository.events({
    'click .searchGit':function(){
        var query = $('.inputQuery').val();
        console.log(query);
        $('.getRepositoryName').html('');
        $('.showAllPackages').html('');

        if(query != ''){
            var repositoryObj = {};
            var repositories = [];

            var gitSearchUrl = 'https://api.github.com/search/repositories?q='+query+'+language:javascript&sort=stars&order=desc';

            var respositoryArr = HTTP.call( 'GET', gitSearchUrl, { "options": "to set" }, function( error, response ) {
                if(!error){
                    var items = response.data.items;
                    items.forEach(function(item){
                        repositoryObj = {};
                        var url = item.html_url;
                        var description = item.description;
                        // var size = item.size;
                        var name = item.name;
                        var stars = item.watchers_count;
                        var forks_count = item.forks_count;
                        // var createdAt = item.created_at;
                        // var updatedAt = item.updated_at;
                        var owner = item.owner.login;
                        var default_branch = item.default_branch
                        repositoryObj['url'] = url;
                        repositoryObj['description'] = description;
                        // repositoryObj['size'] = size;
                        repositoryObj['forks_count'] = forks_count;
                        // repositoryObj['createdAt'] = createdAt;
                        // repositoryObj['updatedAt'] = updatedAt;
                        repositoryObj['name'] = name;
                        repositoryObj['stars']= stars;
                        repositoryObj['owner']= owner;
                        repositoryObj['default_branch'] = default_branch;
                        repositories.push(repositoryObj);
                        Meteor.call('repositories.insert',name,url,description,stars,owner,default_branch);
                    });
                    Session.set('repositories',repositories);
                }
            });
        }

    },
    'click .importPackages':function(event){
        var owner = $(event.target).data('owner');
        var name = $(event.target).data('name');
        var stars = $(event.target).data('stars');
        var default_branch = $(event.target).data('branch');
        console.log(owner,name,default_branch);
        var packageUrl = 'https://raw.githubusercontent.com/'+owner+'/'+name+'/'+default_branch+'/package.json';

        var packages = HTTP.call( 'GET', packageUrl, { "options": "to set" }, function( error, response ) {
            if(!error){
                console.log(response.content);
                if(response.content){
                    var packageJson = JSON.parse(response.content);
                    var packageObj;
                    var devDependencies = {};
                    var dependencies = {};
                    if(packageJson['devDependencies']){
                        devDependencies = packageJson['devDependencies'];
                    }
                    if(packageJson['dependencies']){
                        dependencies = packageJson['dependencies'];
                    }
                    console.log(devDependencies);
                    console.log(dependencies);
                    Meteor.call('packages.insert', devDependencies,dependencies,owner,name,default_branch,stars);
                    Session.set('devDependencies',devDependencies);
                    Session.set('dependencies',dependencies);
                    $('.getRepositoryName').html(name);
                }
            }
            else{
                var dependencies = {}; 
                Session.set('devDependencies',dependencies);
                Session.set('dependencies',dependencies);
                $('.showAllPackages').html('This Project does not contain a package.json file');
                $('.getRepositoryName').html(name);
            }
        });
    }
});
Template.SearchRepository.rendered = function(){
    Meteor.call('getTopRepositories',function(err,res){
        if(!err){
            console.log(res);
            if(res && res.length > 0){
                var eventsArr = [];
                res.forEach(function(event){
                    eventsArr.push(event.name);
                });

                $(".inputQuery").autocomplete({
                    source:eventsArr,
                    minLength: 0
                }).focus(function(){     
                    $(this).autocomplete("search");
                });
            }
        }   
    });
}

Template.SearchRepository.helpers({
    'getRepositories':function(){
        var repositories = Session.get('repositories');
        if(repositories && repositories.length > 0){
            console.log(repositories);
            return repositories;
        }
    },
    'getPackages':function(){
        var dependencies = Session.get('dependencies');
        var devDependencies = Session.get('devDependencies');
        console.log(dependencies);
        console.log(devDependencies);
        var packagehtml = '<table style="border-collapse:collapse;border:1px solid #EEE"><tr><th>package</th><th>Version</th></tr>';
        if(dependencies){
            Object.keys(dependencies).forEach(function(key){
                console.log(key);
                console.log(dependencies[key]);
                packagehtml = packagehtml +'<tr><td>'+key+'</td><td>'+dependencies[key]+'</td></tr>';
            });
        }
        if(devDependencies){
            Object.keys(devDependencies).forEach(function(key){
                console.log(key);
                console.log(devDependencies[key]);
                // Meteor.call('packages.insert', key);
                packagehtml = packagehtml +'<tr><td>'+key+'</td><td>'+devDependencies[key]+'</td></tr>';
            });
        }

        packagehtml = packagehtml+'</table>';
        $('.showAllPackages').html(packagehtml);
    },
    'showIcon':function(name){
        var packages = RepoPackages.find({"name":name}).fetch();
        if(packages && packages.length > 0){
            return false;
        }
        else{
            return true;
        }
    },
});

Template.TopPackages.onCreated(function(){
    Meteor.subscribe('repoPackages');
    Meteor.call('getTopPackages',function(err,res){
        if(!err){
            console.log(res);
            if(res && res.length >0){
                var topPackages = res;
                Session.set('topPackages',topPackages);
            }
        }
    });
});

Template.TopPackages.helpers({
    'getTopPackages':function(){
        return Session.get('topPackages');
    },
    'getRepos':function(packageName){
        console.log(packageName);
        var repositories =  RepoPackages.findOne({"package":packageName}).respositories;
        
        if(repositories){
            var html = '<ul>';
            repositories.forEach(function(repo){
                html = html + '<li>'+repo+'</li>';
            });
            html = html + '</ul>';
            $('.showRepos[data-id="'+packageName+'"]').html(html);
        }

    }
});


Template.TopPackages.events({
    
});


Template.SearchRepository.onCreated(function bodyOnCreated() {
    Meteor.subscribe('repoPackages');
    var repositories = [];
    var dependencies = {}; 
    Session.set('repositories',repositories);
    Session.set('dependencies',dependencies);
    Session.set('devDependencies',dependencies);
});
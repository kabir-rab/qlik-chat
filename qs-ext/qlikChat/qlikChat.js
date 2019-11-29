define( [
	"text!./template.html",
	"text!./chatTemplate.html",
	"text!./lib/css/chat.css",
	"./lib/js/property",
	"jquery",
	"qlik"
],

( template, dialogTemplate, cssContent, prop, jQuery, qlik ) => {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");		
	
	return {
		definition: prop,
		support: {
			export: false,
			exportData: false,
			snapshot: false
		},

		//Main template - for the icon only
		template: template,

		//$http.get can be implemented instead of ajax calls if required
		controller: ['$scope','$http', 'luiDialog', '$q', function( $scope, $http, luiDialog, $q ) {
			const sheetId = qlik.navigation.getCurrentSheetId().sheetId,				
				global = qlik.getGlobal(),
				hostAddress = $scope.layout.apihost;
			let currentUser,
				appId = qlik.currApp().id,
				totalMessage,
				sheetName;
			
			//Fetching sheet title/name from the model	
			qlik.currApp().getObjectProperties(sheetId).then(model =>{				
				sheetName= model.properties.qMetaDef.title;
			});

			console.log(sheetId,"- Current Sheet ID");
			console.log(hostAddress,"- API Host Address");					
			
			//Retrieving logged in user id
			global.getAuthenticatedUser(async reply => {
				currentUser = reply.qReturn;				
				currentUser = currentUser.substring(currentUser.indexOf('; UserId=')+9);
				console.log(currentUser,"- Current User ID");
			});	
			
			//Checking to see if the extension is being run from desktop or server 
			global.isPersonalMode(async reply => {
				let isPersonalMode = reply.qReturn,
					lastSlashIndex;
				console.log(isPersonalMode,"- Personal mode check");														
				isPersonalMode ? (lastSlashIndex = appId.lastIndexOf('\\'), appId = appId.substring(lastSlashIndex + 1), console.log(appId,"- App ID Personal Mode")) 
				: console.log(appId,"- App ID");				
		    }).then(() =>{
				$scope.getTotal().then(data => {console.log(data,"-testing $q 3"); $scope.totalMessage = data;});				
				$scope.$digest();	   
		   	});
			
			//Retrieving total chat messages for the sheet to be displayed in a badge 
			$scope.getTotal = () => {							
				const uri = hostAddress+"/sheetchat/"+appId+"/"+sheetId+"/total";
				var deferred = $q.defer();				
				$http({
					method: 'GET',
					url: uri
				}).then(function successCallback(response) {
						const total = response.data[0].total;
						return deferred.resolve(total);					
					}, function errorCallback(response) {
						const err = response;
						return deferred.resolve(err);
					});					
					return deferred.promise;				
				/*This is no longer in use - using angular http service and $q promise instead.
				$.ajax({
					type: "GET",
					url: uri,
					cache: false,
					success: data => {
						$scope.totalMessage = data[0].total;
						console.log($scope.totalMessage,"- Total messages");
						$scope.$digest();						
					}
				});*/
			}							
			
			//LUI popup - main chat window based on leonardo UI from Qlik
			$scope.openDialog = () => {
				luiDialog.show({
					template: dialogTemplate,
					closeOnEscape: false,
					//variant: "inverse",
					input: {
						name: $scope.name
					},

					//Chat window controller
					controller: ['$scope','$interval','$timeout', function( $scope, $interval, $timeout) {						
						let count = 0;					
												
						$scope.text = ''
						$scope.sheetName = sheetName;

						//Fetching al the chat messages for the sheet
						//This needs re-writing so the logic for rendering is in the view using ng-repeat...
						$scope.getData = () => {							
							const uri = hostAddress+"/sheetchat/"+appId+"/"+sheetId;							
							$.ajax({
								type: "GET",
								url: uri,
								cache: false,
								success: data => {									
									console.log("Data retrieval success for - ",uri);																
									$.each(data, (key, item) => {
										const dateSplit = item.created_on.split(/[- T : .]/),
											timeStamp = dateSplit[0]+'-'+dateSplit[1]+'-'+ dateSplit[2]+' '+ dateSplit[3]+':'+ dateSplit[4]+':'+ dateSplit[5];										
										if(item.user_id == currentUser){											
											item.cssName = "speech-user";
											item.cssContent = "speech-bubble";
											item.timeStamp = timeStamp;
										}
										else{											
											item.cssName = "speech-user-other";
											item.cssContent = "speech-bubble-other";
											item.timeStamp = timeStamp;											
										}									
									});								
									$scope.messages = data;
									$scope.$digest();									
									/*
									//Use this if you like to add animation to scroll
									$('#message').stop().animate({
										scrollTop: $('#message')[0].scrollHeight
									}, 1000);
									*/									
									$timeout(function() {
										let scrollElement = document.getElementById("message");
										scrollElement.scrollTop = scrollElement.scrollHeight;
									}, 0, false);									
								}
							});
						}
												
						$scope.getData();
						
						//$interval function is used to auto refresh the chat.
						let auto = $interval(() => {
							$scope.getData();							
							$scope.displayMsg = "This is auto Refreshed " + count + " counter time.";
							count++;
							console.log(count,"- Refresh count");							
						}, 10000);					
						
						//Cancel the $interval
						$scope.stopRefresh=() => {
							if(angular.isDefined(auto))
							  {
								$interval.cancel(auto);
								auto=undefined;
							  }
						 };					
						
						//Adding new chat message
						$scope.addItem = () => {							
							const uri = hostAddress+"/chat",
								item = {
									user_id: currentUser,
									user_name: currentUser,
									app_id: appId,
									sheet_id: sheetId,
									message: $("#add-message").val()
								},							
								json = JSON.stringify(item);
							
							$.ajax({
								type: "POST",
								accepts: "application/json",
								url: uri,
								contentType: "application/json",
								data: JSON.stringify(item),
								error: (jqXHR, textStatus, errorThrown) => {
									console.log(jqXHR, textStatus, errorThrown);
									alert(errorThrown);
								},
								success: function(result) {
									$scope.getData();									
									$("#add-message").val("");
									console.log(json,"- Added successfully");
								}
							});
						}						
					}]
				});
			};				
		}],
		paint: function ($element) {
			return qlik.Promise.resolve();
		}
	};
});


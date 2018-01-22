//Callback function       
    function myCallback(dataFromTwitterApi){
            //Save data from api to local storage for retrieval later
            saveToLocalStorage(dataFromTwitterApi);
            var numberOfTweets = dataFromTwitterApi["tweets"].length;
            var text="";
             $("#twitterFeedRows tbody").find('tr').remove();
             for(var i=0;i<numberOfTweets;i++){
                
                twitterEntry = dataFromTwitterApi["tweets"][i];
                 var tweetUrl="";
                 var viewMore=" ";
                 if(twitterEntry["urlentities"].length!=0)
                 {
                     tweetUrl+=twitterEntry["urlentities"][0].url;
                     viewMore= "<a target='_blank' href='" + tweetUrl +"'>"+ " View More "+'</a>'; 
                 }
                var createdDate= new Date(twitterEntry.createdAt);
                var id= parseInt(i+1);
                text = '<tr'+" id= "+id +' draggable= true ondragstart="drag(event)"><td><p><img src = "' + twitterEntry.user.biggerProfileImageURL +'"/>' +"<a target='_blank' href='https://twitter.com/"+twitterEntry.user.screenName+"'>"+twitterEntry.user.name+"</a>"+" " +"@"+twitterEntry.user.screenName+ " &nbsp;&nbsp;<p> "+createdDate.toDateString()+"<br/>" +twitterEntry['text'] + viewMore + '</p></td></tr>';
            $("#twitterFeedRows tbody").append(text);    
            }
        }

//HTML5 drop function
        function allowDrop(ev) {
            ev.preventDefault();
        }
//HTML5 drag function
        function drag(ev) {
            ev.dataTransfer.setData("text", ev.target.id);
        }
//HTML5 drop function
        function drop(ev) {
            ev.preventDefault();
            var data = ev.dataTransfer.getData("text");
            
            if (ev.target.id.match("savedFeeds")==false)
            return false;
            else
            ev.target.appendChild(document.getElementById(data));
            //All rows that have been dropped to the saved table
            getAllRowIds();
            //Save all those rows that were dropped
            saveTweets();
        }

        function saveToLocalStorage(dataFromTwitterApi)
        {
            localStorage.setItem("DataFromApi",JSON.stringify(dataFromTwitterApi));    
        }

        function getAllRowIds()
        {
            var ids= $("#twitterFeedSavedRows tbody").find("tr");
            if(ids!=null)
            {
                var idList="";
                for(var k=0;k<ids.length;k++)
                {
                    idList+= ids[k].id+",";
                }
                $("#allSavedTweets").val(idList);
            }
        } 

        function saveTweets()
        {
            var arr=[];
            var dataFromLocalStorage= localStorage.getItem("DataFromApi");
            var text="";
            var alltweets= JSON.parse(dataFromLocalStorage);
            var arr=[];
            var idsList= $("#allSavedTweets").val();
            var arrIdList=idsList.split(",");  
            for(var selectedTweets=0; selectedTweets<arrIdList.length;selectedTweets++)
            {
                for(var i=0;i<alltweets.tweets.length;i++)
                {
                    if(i==arrIdList[selectedTweets]-1)   
                    {
                        var savedtweet = alltweets.tweets[i];
                        var urlViewMore="";
                        var viewMore=" ";
                        if(savedtweet["urlentities"].length!=0)
                        {
                             urlViewMore+=savedtweet["urlentities"][0].url;
                        }
                    var createdDate= new Date(savedtweet.createdAt).toDateString();            
                    arr.push(new SaveTweetLocal(savedtweet.user.biggerProfileImageURL,createdDate,savedtweet.user.name, savedtweet.user.screenName,savedtweet.text,urlViewMore))
                    }
                 }
            }
        
            localStorage.setItem("SavedTweetFeeds", JSON.stringify(arr)); 
        }

    //Class to store data locally
        function SaveTweetLocal(imagesrc,createDate,name, screenname, tweetText, urlIfAny){
            this.ImageSrc=imagesrc;
            this.CreateDate=createDate;
            this.Name=name;
            this.ScreenName=screenname;
            this.TweetText=tweetText;
            this.UrlIfAny=urlIfAny;  
        }
       
       //Search function to update left column. Right column is cleared for new tweets to be dropped and evntually saved
        $(function(){
            $("#SearchTwitter").on('click', function(){
                if($("#searchtext").val()!="")
                {$("#twitterFeedSavedRows tbody").find("tr").remove();}
                $.ajax({
                        url: "http://tweetsaver.herokuapp.com/",
                        dataType: "jsonp",
                        data: {
                            q: $("#searchtext").val(),
                            count: 10,
                            format: "json"
                        },
                        success: function( response ) {
                                console.log( response ); // server response
                                myCallback(response);            
                            }
                        });
                    });
            })


            $(document).ready(function() {
                //check if browser is HTML5 localstorage compliant
                if(!(typeof window.localStorage == "undefined"))
                    console.log(true);
                else{
                    alert("HTML5 local storage not defined for this browser");
                }
		    
		            //On Page load- retrieve tweets from localtorage
                    loadSavedTweets();
	        });

//Loading last saved tweets
        function loadSavedTweets()
        {
            if(localStorage.getItem("SavedTweetFeeds")!=null)
            {
                var savedfeeds=JSON.parse(localStorage.getItem("SavedTweetFeeds"));
                $("#twitterFeedSavedRows tbody").find("tr").remove();
                var text="";
            for(var j=0; j<savedfeeds.length;j++)
            {
                var viewmore="";
                if(savedfeeds[j].UrlIfAny!="")
                {
                    viewmore+="<a target='_blank' href='" + savedfeeds[j].UrlIfAny +"'>"+ " View More "+'</a>';
                }
                text = '<tr><td><p><img src = "' + savedfeeds[j].ImageSrc +'"/>' +"<a target='_blank' href='https://twitter.com/"+savedfeeds[j].ScreenName+"'>"+savedfeeds[j].Name+"</a>"+" " +"@"+savedfeeds[j].ScreenName+ " &nbsp;&nbsp;<p> "+savedfeeds[j].CreateDate+"<br/>" +savedfeeds[j].TweetText + viewmore + '</p></td></tr>';
                $("#twitterFeedSavedRows tbody").append(text); 
            }
            
            }
        }
          
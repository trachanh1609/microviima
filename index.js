
const request = require('request-promise');
const viimaOption = {
  url: 'https://demo.viima.com/api/customers/78/activities/',
  json: true
}

const slackOption = {
  method: 'POST',
  url: 'https://hooks.slack.com/services/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',
  json: true,
  body: {"channel": "#viima-updates", "username": "slackBot", "text": "", "icon_emoji": ":penguin:"}
}

let noOfComments = 0 ;

(function(){

    // get initial number of Comments in Viima
    request(viimaOption)
      .then(response => {
          noOfComments = response.count
      }).catch(function (err) {
          noOfComments = 0
          console.log('Error getting Number of Comments :')
          console.log(err)
    });

    // run the slackbot which check Viima new comments every 5s
    slackbot(viimaOption, slackOption)

})();


function slackbot(viimaOption, slackOption){
  let interval = 5000;
  setInterval( ()=> {
    checkAndSendNewComment(viimaOption, slackOption)
  }, interval);
}

function checkAndSendNewComment(viimaOption, slackOption){
  console.log('Checking new comment ...')
  request(viimaOption)
    .then(response => {
        // only send message if there are new comments
        if (response.count > noOfComments){
          let noOfNewComments = response.count - noOfComments
          sendMessagesToSlack(response, slackOption, noOfNewComments)
          noOfComments = response.count
        } else {
          console.log('No new comment.')
        }
    }).catch(function (err) {
        console.log('Error getting Viima response :')
        console.log(err)
  });

}

function sendMessagesToSlack(data, slackOption, noOfNewComments){
    let lastComments

    lastComments = data.results.slice(0, noOfNewComments)

    lastComments.forEach(comment => {
      sendMessage(comment, slackOption)
    })
}

function sendMessage(comment, slackOption){

  slackOption.body.text = 'Topic : ' + comment.name + '\n'
  slackOption.body.text += 'User : ' + comment.fullname + '\n'
  slackOption.body.text += 'Content : ' + comment.content + '\n'

  request(slackOption)
    .then(res => console.log('New comment sent ' + res + '. *************************'))
    .catch(err => {
        console.log('Error posting to Slack channel :')
        console.log(err)
  });
}

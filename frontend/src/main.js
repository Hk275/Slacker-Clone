import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

// ALL GLOBAL VARIABLES

let TOKEN = ''
let USERID = ''

//-----------------------

// Event Listeners 

document.getElementById('close_send_image').addEventListener('click', () => {
    hideElements("bottom","Send_Image");
})

// get details of requested user update and send to server/backend
document.getElementById('update_prof').addEventListener('click', () => {

    let newPass = document.getElementById('passProfile').value;
    let newName = document.getElementById('update_name').value;
    let newBio = document.getElementById('update_bio').value;
    let newMail = document.getElementById('update_email').value;
    const files = document.querySelector('input[id="myFile"]').files;
    let neWimage = '';

    let file = files[0];
    fileToDataUrl(file)
    .then((data) => {
        if (data != null) {
            neWimage= data;
        }
        if (newPass == null) {
            alertUser("Please enter a password");
        }
        if (newName == ''){
            //assign previous name
            newName = document.getElementById('nameProfile').innerText;
        }
        if (newBio == ''){
            //assign previous bio 
            newName = document.getElementById('bioProfile').innerText;
        }
    
        if (newMail == ''){
            //assign previous email
            newName = document.getElementById('emailProfile').innerText;
        }
    
        let body = {
            email : newMail,
            password :newPass,
            name :newName,
            bio : newBio,
            image : neWimage,
        }
    
        let path = "user";
        APIFetch('PUT',path,TOKEN,body)
        .then((data) =>{
            console.log("update profile");
        })
        .catch((data) => {
            console.log("issue", data);
        })
        // Button for user profile change
        document.getElementById('userName').innerText = newName;
        hideElements('bottom','UserProfile');
    })
    
   
})

document.getElementById('close_profile_other').addEventListener('click', () => {
    hideElements("bottom",'OtherUserProfile');
})

document.getElementById("cancel_Edit").addEventListener('click', () => {

    hideElements("bottom","edit_channel")
})

document.getElementById("no_Channel").addEventListener('click', () => {
    hideElements("bottom","create_channel");
})

document.getElementById("Edit_Channel_btn").addEventListener('click', () => {
    hideElements("edit_channel", "bottom");
});

document.getElementById("cancel_new_message").addEventListener('click', () => {
    hideElements("bottom","Send_message");
})

document.getElementById('close_profile').addEventListener('click', () => {
    hideElements('bottom','UserProfile');
})

// Hide and show password of user 
document.getElementById('show').addEventListener('click', () => {

    let passwordBox = document.getElementById('passProfile');

    if(passwordBox.type === 'password') {
        passwordBox.type = "text";
    } else {
        passwordBox.type = "password";
    }
})

// Display user profile
document.getElementById("userName").addEventListener('click', () => {

    let path = "user/" + USERID;

    APIFetchGet('GET',path,TOKEN)
    .then((uInfo) =>{
        console.log(uInfo);
        let name = "'"+ uInfo['name'] + "'";
        let email = uInfo['email'];
        let bio = uInfo['bio'];
        let ProfPic = uInfo['image'];
        if (bio == null) {
            bio = "No bio has been set";
        }
        if (ProfPic == null) {
            ProfPic = "default.png";
        }

        document.getElementById('nameProfile').innerText = name;
        document.getElementById('emailProfile').innerText = email;
        document.getElementById('bioProfile').innerText = bio;
        document.getElementById('picProfile').src = ProfPic;

        hideElements('UserProfile','bottom');
    }) 
})

// When edit is requested by user get all data 
// and send
document.getElementById("push_ch_edit").addEventListener('click', () => {

    let chID = document.getElementById('channel_edit_ID').value;
    let newName = document.getElementById('channel_edit_name').value;
    let newDescri = document.getElementById('channel_edit_descr').value;
    let body = {
        name: newName,
        description: newDescri
    }

    let path = 'channel/' +chID 

    APIFetch('PUT',path,TOKEN,body)
    .then((data) => {
        console.log(data);
    })
    .catch((data) => {
        console.log(data);
    })

    // Remove Current List
    hideElements("bottom","create_channel");
    removeChild('Private_List');
    removeChild('Public_List');

    //Update list
    APIFetchGet('GET', 'channel',TOKEN)
    .then((data) => {
        chanelCreate(data,USERID);
    })
    .catch((data) => {
        console.log("OOOPS mistake", data);
    })
    ideElements("bottom","edit_channel");
    
});

// Get details about a new channel and send 
// to server/backend
document.getElementById("push_Channel").addEventListener('click', () => {

    let ch_name = document.getElementById("channel_name").value;
    let channel_type = document.getElementById('channel_type').value ;
    let channel_desc = document.getElementById('channel_description').value;

    if ( channel_type.toLowerCase() == 'private') {
        channel_type = 'true';
    } else if (channel_type.toLowerCase() == 'public') {
        channel_type = 'false'
    }

    let myBool = (channel_type.toLowerCase() === 'true');
    if(!channel_desc) {
       channel_desc = "Defualt Description";
    }

    const body = {
        name : ch_name,
        private : myBool,
        description : channel_desc
    }

    let cInfo = ''

    APIFetch('POST','channel',TOKEN,body)
    .then((data2) => {
        let cID = data2['channelId'];
        console.log(cID);
        cInfo = cID;
        let path = "channel/" + cID;
        APIFetchGet('GET',path,TOKEN)
        .then((data) => {
            let names = []
            let name = data['name'];
            let status = data['private'];
            if (status == false) {
                status = 'Public';
            } else if (status == true) {
                status = 'Private';
            }
            names.push(name);
            addChannel(status,names,null,cInfo);
        })
    }) 
    .catch((data) => {
        console.log('catch',data);
    })
    hideElements("bottom","create_channel");
});

// When clicked on create new channel forum is displayed
document.getElementById("New_Channel").addEventListener('click', () => {
    hideElements("create_channel", "bottom");
});

// When clicked cancel close forum
document.getElementById("no_Channel").addEventListener('click', () => {
    hideElements("bottom", "create_channel");
});

// Register an account
// Collect and send input to server/backend
document.getElementById("register-submit").addEventListener("click", () => {

    const email = document.getElementById('email-register').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('pwd-register').value;
    const confrim_password = document.getElementById('pwd-register-confrim').value;
 
    const body = {
        email:email,
        password:password,
        name:name,
    }
 
    if (password != confrim_password) {
     alertUser("Please re-type passoword, make sure they are same")
     } else {    
         APIFetch('POST','auth/register',null,body)
         .then((data) => {
             console.log('then', data);
         }) 
         .catch((data) => {
             alertUser(data);
         })
     }
 })

document.getElementById("login-link").addEventListener('click', () => {
    hideElements("login","register");
    document.getElementById("login-link").style.fontWeight = "bold";
    document.getElementById("register-link").style.fontWeight = "normal";

})

document.getElementById("register-link").addEventListener('click', () => {
    hideElements("register","login");
    document.getElementById("login-link").style.fontWeight = "normal";
    document.getElementById("register-link").style.fontWeight = "bold";

})

document.getElementById('cancel_Edit_message').addEventListener('click',() => {
    hideElements('bottom','edit_message')
});

// When user clicks the login in button 
// it logs the user into the app
document.getElementById("login-submit").addEventListener("click",() => {
   
    const email = document.getElementById('email').value;
    const password = document.getElementById('pwd').value;
    const body= {
        email:email,
        password:password,
    }
 
    APIFetch('POST','auth/login',null,body)
    .then((data) => {
        // Get data of all channels
        document.getElementById('bottom').style.display = 'block';
        storeToken(data['token']);
        storeUSERID(data['userId']);
 
        APIFetchGet('GET','channel',TOKEN)
        .then((data2) => {
         chanelCreate(data2,USERID);
        })
        .catch((err) => {
            alertUser(err);
        })
    })
    .catch((data)=> {
        alertUser(data);
    })
 
 })


//--------------------------------

// Functions

// A modal which is displayed to user, with given error
function alertUser (message) {
    const myModal = new bootstrap.Modal(document.getElementById('myModal'))
    document.getElementById('Display_error').innerText = message;
    myModal.show();
}

//A modal is displayed to the user, with given image 
// and option to view other images in the channel 
// img_src = src of the clicked image 
// img_list = images in channel 
function imageModal(img_src, img_list) {

    const myModal = new bootstrap.Modal(document.getElementById('channelModal'))

    const display = document.getElementById('modal_display')
    const prev =  document.getElementById('prevImage');
    const next = document.getElementById('nextImage');
        
    display.src = img_src;
    
    const numofImages = img_list.length - 1;

    let i = img_list.indexOf(img_src);

    if ( i == 0) {
        prev.style.display = "none";
    } 
    else if (i == numofImages) {
        next.style.display = "none";
    }
    if (numofImages == 0) {
        prev.style.display = "none";
        next.style.display = "none";
    }     
    
    myModal.show();

    prev.addEventListener('click', () => {

        i--;
        display.src = img_list[i];
        
        if ( i == 0) {
            i = 0;
            console.log("reached")
            next.style.display = "block";
            prev.style.display = "none";
        } 
    })

    next.addEventListener('click', () => {

        i++;
        display.src = img_list[i];

        if ( i == numofImages) {
            prev.style.display = "block";
        
            i = numofImages;
            console.log("max")
            next.style.display = "none";
        } 
    })

}


// Used to intereact with server
// Code has been taken from the live lecs 
function APIFetch (method,path,token,bod) {

    const requestOptions = {
        method :method,
        headers : {'Content-Type': 'application/json'},
        body : JSON.stringify(bod),
    }

    if (token !== null) {
        requestOptions.headers['Authorization'] = 'Bearer '+token;
    }

    if (bod == null) {
        requestOptions.body = '';
    }

    const url = 'http://localhost:5005/'+path

    return new Promise((resolve,reject) => {
        fetch(url,requestOptions)
        .then((response) => {
            if(response.status == 400 || response.status == 403) {
                response.json().then((er) => {
                    reject(er['error']);
                });
            } else if (response.ok) {
                response.json().then((data) => {
                    resolve(data);
                });
            }
        })
        .catch((err) => console.log(err));
    });
}

// Used to intereact with server
// Code has been taken from the live lecs 
function APIFetchGet  (method,path,token) {

    const requestOptions = {
        method :method,
        headers : {'Content-Type': 'application/json'},
    }

    if (token !== null) {
        requestOptions.headers['Authorization'] = 'Bearer '+token;
    }

    const url = 'http://localhost:5005/'+path

    return new Promise((resolve,reject) => {
        fetch(url,requestOptions)
        .then((response) => {
            if(response.status == 400 || response.status == 403) {
                response.json().then((er) => {
                    reject(er['error']);
                });
            } else if (response.ok) {
                response.json().then((data) => {
                    resolve(data);
                });
            }
        })
        .catch((err) => console.log(err));
    });
}

function storeToken (tokenU) {
    TOKEN = tokenU;
}
function storeUSERID (userI) {
    USERID=userI;
}

// Gets the user name using ID
// and changes the innerText of an
// element, with id = elementid
function getUserName(id,token,elementid,value) {

    let path = "user/" + id
    const promisList = [];
    
    promisList.push(APIFetchGet('GET', path,token)
    .then((data) => {
        return(data['name']);
    })); 

    Promise.all(promisList)
    .then(data2 => {
       document.getElementById(elementid).innerText = data2[0] + " ";
    })
}

// From list of channels and user_id
// Display the user a list of all public channels
// and private channels they are are part of 
// after loging in
function chanelCreate (data,user_id){

    getUserName(user_id,TOKEN,'userName');
   
    const channelInfo = data['channels'];

    // Get public  channels
    let public_channels = data['channels'].filter(el => el.private == false);
    
    // get private channels
    let private_channels = data['channels'].filter(el => el.private == true && el.members.includes(user_id)) ;
    
    // Get public channel names 
    let name_public = public_channels.map(getChannelName);

    addChannel('Public',name_public,channelInfo,null);

    // get private channel names
    let name_private = private_channels.map(getChannelName);
    
    addChannel('Private',name_private,channelInfo,null);

    document.getElementById("first-page").style.display = 'none';
    document.getElementById("Channels_first").style.display = 'flex';

}

// Helper function used to filter list
function getChannelName(item) {
        return[item.name];
}

// Add channel details to appropiate list 
// of channel public/private 
// type = type of channel 
// list = list of channels to add
// cInfo = channel info 
// cID = channel ID
function addChannel (type,list,cInfo,cID) {
    if (type == 'Public'){
        for(let i in list) {
            let name = list[i];
            addToList(name,'Public_List',cInfo,cID);
        }
    } else if (type == "Private") {
        for (let i in list) {
            let name = list[i];
            addToList(name,'Private_List',cInfo,cID);
        }
    }
};

// Adds channels to appropiate list 
// creates buttons for each channel to access 
// channel page
// name = channel name
// ParentName = parent Element of btn 
function addToList (name,ParentName,cInfo,cID) {

    let node = document.createElement("LI");
    let btn = document.createElement("button");

    btn.innerText = name;
    node.appendChild(btn);
    btn.setAttribute("id", name);

    document.getElementById(ParentName).appendChild(node);

    document.getElementById(name).addEventListener('click', () => {
        removeChild('Messhere');
        channelDescription(name,cInfo,cID);
        getMessages (name,cInfo,cID);
    });
}

// Take information of channels 
// and display messages
function getMessages (name,cInfo,cID) {

    let channel_id = ''
    
    if (cID==null){
        let channelDetails = cInfo.filter(el => el.name == name);
        channelDetails = channelDetails[0];
        channel_id = channelDetails['id']
    } else if (cInfo==null) {
        channel_id = cID
    }

    // Have extraxted channel ID now 
    // get messages

    let query = "?start=0"
    let path = 'message/' + channel_id +query;

    APIFetchGet('GET',path,TOKEN)
    .then((data) => {

        // Extraxting specific info from messages info
        let info= data['messages'];
        let messages = info.map(getmes);
        let ids = info.map(getID);
        let time = info.map(getTime);
        let mesageIds = info.map(mesIdS);

        displayMessages(messages,ids,time,mesageIds,channel_id,info);
    }) .catch((data) => {
        console.log(data);
    })
}

//helper function to extraxt 
// message id
function mesIdS(item) {
    return[item.id];
}

// Displays messages on the chanel screen
// info = access to all messages in the channel
// all AAList input refers to the channels AA info
function displayMessages(messageList,idList,timeList,mesageIds,channel_id,info){

    removeChild('Messhere');
    
    const node = document.getElementById('message_display');
    const displayArea = document.getElementById('Messhere');
    
    addReleventBtn(channel_id,displayArea);
    
    // Stores all the images in the list
    let listofimages = []

    for (let i in messageList) {
        let newMes = node.cloneNode(true);
        
        //Get relevant information for ith message
        let message = messageList[i];
        let time = timeList[i];
        let u_ID = idList[i];
        let mesId = mesageIds[i]

    
        // Checker if message is an image
        let allMess = info[i];
        let checker = allMess['image'];

        if (checker == '' || checker == null) {
            newMes.innerText = message +  " || Sent at: " +time + "|| Sent by: "  ;
        } else if (checker != '') {
            listofimages.push(checker);
            let src = checker;

            let img_mesg = document.createElement("img");
            img_mesg.setAttribute("id", "image_display"+i+u_ID);
            img_mesg.src = src;
            img_mesg.style.height = '50px';
            img_mesg.style.width = '50px';

            let sender_info = document.createElement('span');
            sender_info.innerText = "|| Sent by: "

            newMes.appendChild(img_mesg);
            newMes.appendChild(sender_info);
        }

        // Adding senders name and making it clickable 
        let userNameDisplay = document.createElement('span');
        userNameDisplay.setAttribute("id", "span_"+i+u_ID);
        userNameDisplay.className = u_ID;
        newMes.appendChild(userNameDisplay);
        getUserName(u_ID,TOKEN,"span_"+i+u_ID);


        // add senders profile pic 
        let img = document.createElement("img");
        addIm(img,u_ID,"ProfPic" + i + u_ID);
        newMes.appendChild(img);

        // Creating Relevant  btns for  messages

        // Pin message
        let btn = document.createElement("button");
        btn.innerText = "Pin";
        btn.setAttribute("id", mesId);
        newMes.appendChild(btn);

        //unpin message
        let btn2 = document.createElement("button");
        btn2.innerText = "UnPin";
        btn2.setAttribute("id", "Un"+mesId);
        newMes.appendChild(btn2);
        
        //delete message
        let btn3 = document.createElement("button");
        btn3.innerText = "Delete";
        btn3.setAttribute("id", "Del"+mesId);
        newMes.appendChild(btn3);

        // edit message
        let btn4 = document.createElement("button");
        btn4.innerText = "Edit";
        btn4.setAttribute("id", "Edit"+mesId);
        newMes.appendChild(btn4);

        // react to message
        let btn5 = document.createElement('button')
        btn5.innerText = "React";
        btn5.setAttribute("id", "React"+mesId);
        newMes.appendChild(btn5);

        newMes.style.display = 'block';
        
        displayArea.appendChild(newMes);

       // Add eventlistenrs to relevant section of the message

        document.getElementById("Un"+mesId).addEventListener(("click"), () => {
            Unpin(channel_id,mesId);
        })

        document.getElementById(mesId).addEventListener(("click"), () => {
            pin(channel_id,mesId);
        })
       
        document.getElementById("Del"+mesId).addEventListener(("click"), () => {
            Delete(channel_id,mesId);
        })
        document.getElementById("Edit"+mesId).addEventListener(("click"), () => {
            Edit(channel_id,mesId,message);
        })
        document.getElementById("React"+mesId).addEventListener(("click"), () => {
            React(channel_id,mesId);
        })

        document.getElementById("span_"+i+u_ID).addEventListener(("click"), () => {
            let uID =  document.getElementById("span_"+i+u_ID).className;
            displayOtherProfile(uID);
        })

        if (checker != '' && checker != null) {
            document.getElementById("image_display"+i+u_ID).addEventListener(('click'),() => {
            imageModal(checker,listofimages);
            })
        }
    }
}

// Collects uploaded image to send 
function channel_image(channel_id) {
    
    hideElements("Send_Image","bottom");

    document.getElementById('send_new_pic').addEventListener('click', () => {
        const file = document.getElementById('upload_new_img').files[0];
        fileToDataUrl(file)
        .then((data) => {
            sendImagemessage(channel_id,data);
        })
    });

}

// Send an image message using
// img_path = url for image user has uploaded
// cid = channel id
function sendImagemessage(cid,img_path) {

    let body = {
        message : '',
        image: img_path,
    }

    let path = "message/" + cid;

    APIFetch('POST',path,TOKEN,body) 
    .then((data) => {
    }) 
    .catch((data)=> {
        console.log("failed to send",data);
    })

    hideElements("bottom","Send_Image")
}
 
// Collect the reaction of user for
// a paticular message
function React(channel_id,mesId){

    hideElements("React","bottom");
   
    document.getElementById('Emoji_1').addEventListener(("click"),() => {
        send_React(1,channel_id,mesId)
        hideElements("bottom","React");
    });

    document.getElementById('Emoji_2').addEventListener(("click"),() => {
        send_React(2,channel_id,mesId)
        hideElements("bottom","React");
    });

    document.getElementById('Emoji_3').addEventListener(("click"),() => {
        send_React(3,channel_id,mesId)
        hideElements("bottom","React");
    });
}

// Send reaction by user to backend
function send_React(react,channel_id,mesId) {

    let body = {
        react: react,
    }

    let path ="message/react/" + channel_id + "/" + mesId;

    APIFetch('POST',path,TOKEN,body)
    .then((data) => {
    }) 
    .catch ((data) => {
        console.log("no",data);
    })

}

// A helper funciton which edits the 
// style of the two input elements 
function hideElements(display,hide) {
    document.getElementById(display).style.display = "block";
    document.getElementById(hide).style.display = "none";
}

// collect message from user 
function sendMessage(cid) {

    hideElements('Send_message', 'bottom')

    document.getElementById('message_to_send').value = null;

    document.getElementById('push_new_message').addEventListener('click', () => {
        let msgval = document.getElementById('message_to_send');
        let msg = msgval.value;
        if (msg != '' && msg !=null) {
            makeSubmission(cid,msg);
        }
        else if (msg =='' || msg == null) (
            alertUser("Please enter message to send")
        ) 
    });
}

// submits message to backend 
function makeSubmission(cid,send_Message) {

    let body = {
        message : send_Message,
        image: '',
    }
    let path = "message/" + cid;

    APIFetch('POST',path,TOKEN,body) 
    .then((data) => {
    }) 
    .catch((data)=> {
        console.log("failed to send",data);
    })
    hideElements('bottom','Send_message');
}

// Submit eddited message to backend
function makeEdit (channelId,mesId,newMessage,img) {

    let body = {
        message : "Edited:" + newMessage,
        image: img,
    }

    let path = "message/" + channelId + "/" + mesId

    APIFetch('PUT',path,TOKEN,body)
    .then((data) => {
        refreshAfterdel(channelId,mesId);
    }) 
    .catch((data) => {
        alertUser(data);
    })
    hideElements('bottom','edit_message');
}

// Collects the edited message user wants to make
function Edit(channel_id,mesId,currmessage) {

    hideElements("edit_message","bottom")

    document.getElementById('push_edit_message').addEventListener('click', () => {
        let newMessage = document.getElementById('message_edit').value;
        if (currmessage == newMessage) {
            alertUser("Please enter different message than before");
        } 
        else if (currmessage != newMessage){
            makeEdit(channel_id,mesId,newMessage);
        }
    })
};


// Delete the message user wants to delete
function Delete(channel_id,mesId) {

    let path = "message/" + channel_id+ "/" + mesId;

    APIFetchGet('DELETE',path,TOKEN)
    .then((data) => {
        refreshAfterdel(channel_id);
    })
    .catch((data) => {
        alertUser(data);
    })
}

// Refreshes the channel page after a message has been deleted
function refreshAfterdel(channel_id) {
    
    removeChild('Messhere');

    // Extract all meesages 
    let query = "?start=0"
    let path = 'message/' + channel_id +query;

    APIFetchGet('GET',path,TOKEN)
    .then((data) => {
        
        let info= data['messages'];
        let messages = info.map(getmes);
        let ids = info.map(getID);
        let time = info.map(getTime);
        let mesageIds = info.map(mesIdS);

        displayMessages(messages,ids,time,mesageIds,channel_id,info);
    }) .catch((data) => {
        console.log("Error:", data);
    })

}

// function unpin messeage
function Unpin(channel_id,mesId) {

    let path = 'message/unpin/' + channel_id + '/' + mesId;
    const body = {
    };

    APIFetch('POST',path,TOKEN,body) 
    .then((data) => {
        console.log("it is unpined", data);
    })
    .catch((data) => {
        alertUser(data );
    })

}

// check channels messages if they are pinned
// if pinned display
function viewpinnedMess(channel_id) {

    let query = "?start=0"
    let path = 'message/' + channel_id +query;
    
    APIFetchGet('GET', path,TOKEN) 
    .then ((data) => {
        let pinned = data['messages'].filter(el => el.pinned == true);
        displayNodes(pinned);
    })
    .catch((data) => {
        console.log(data);
    })
 
}

// Display pinned messages when 
// requested by user
function displayNodes(pinned) {

    let node = document.getElementById('message_display');

    removeChild('checkPiined');

    let display = document.getElementById('checkPiined');

    let messages = pinned.map(getmes);
    let ids = pinned.map(getID);
    let time = pinned.map(getTime);
    
    //loop through messages
    for (let i  in pinned) {

        let message = messages[i];
        let uID = ids[i];

        let newMes = node.cloneNode(true);

        newMes.innerText = "Message: " + message +" Sent at: " + time[i] + "|| Sent by: "; 

        newMes.style.display = 'block';

        let span = document.createElement("span");
        span.setAttribute('id', "Span_"+i+"_"+uID);
        getUserName(uID,TOKEN,"Span_"+i+"_"+uID); 

        newMes.appendChild(span);
        display.appendChild(newMes);
    }

    // appending a button to close pinned
    let btn = document.createElement("button");
    btn.innerText = "close";
    btn.setAttribute('id', "close_pinned");
    btn.setAttribute('class', "btn btn-danger");
    display.appendChild(btn);


    document.getElementById("close_pinned").addEventListener('click', () => {
        hideElements('bottom',"checkPiined");
    })

    hideElements('checkPiined',"bottom");
}

// Pin a message, send to backend
function pin(channel_id,mesID) {

    let path = "message/pin/" + channel_id + '/' +mesID;
    const body = {

    }

    APIFetch('POST',path,TOKEN,body) 
    .then((data) => {
        console.log("it workeda", data);
    })
    .catch((data) => {
        alertUser(data);
    });
}

// Following are helper functions which have been used to
// map an array
function getmes(item) {
    return [item.message];
}
function getID(item) {
    return[item.sender];
}
function getTime(item) {
    let time = item.sentAt;
    const userFreindly = time.split("T")[0];
    return[userFreindly];
}
function getPinned(item) {
    return [item.pinned];
}

// Get appropiapte info for the channel 
// description section of the page
function channelDescription (name,cInfo,cID) {
     
    let channel_id = ''

    if (cID==null){
        let channelDetails = cInfo.filter(el => el.name == name);
        channelDetails = channelDetails[0];
        channel_id = channelDetails['id']
    } else if (cInfo==null) {
        channel_id = cID;
        console.log("NEWESDFSDF", channel_id);
    }
    
    let path = 'channel/' + channel_id

    APIFetchGet('GET',path,TOKEN)
    .then((data) => { 
        addDescription(data,channel_id);
    }) .catch((data)=> {
        if (data == "Authorised user is not a member of this channel") {
            notMember(name,channel_id,data);
        }
    })
}

// If user is not a memeber of a channel 
// what message to display on channel page
function notMember (name,channel_id,data) {

    hideElements('Not_member','Description')
    document.getElementById('Welcome_mess').style.display = 'none';
    
    document.getElementById('Not_member').innerText = "You are not member of this channel"

    let btn = document.createElement("button");
    btn.innerText = "Join " + name;
    btn.setAttribute("id", "Join_"+name);
    btn.setAttribute('class', "btn btn-success");
    document.getElementById('Not_member').appendChild(btn);

    document.getElementById("Join_"+name).addEventListener(('click'), () => {
        user_Join_Channel(channel_id,data);
    })
    
}

// Send backend user wanting to join 
function user_Join_Channel (channel_id,data) {

    let body = {

    }
    let path = "channel/" + channel_id + "/join";

    APIFetch("POST",path,TOKEN,body)
    .then((data2) => {
        alertUser("You are now a memember, to access information please leave page and access the page again from list")
    })
    .catch((data) => {
        alertUser(data);
    })
}

// Send backend user wants to leave
function user_Leave_Channel(channel_id) {

    let body = {

    }

    let path = "channel/" + channel_id + "/leave";
    
    APIFetch("POST",path,TOKEN,body)
    .then((data2) => {
        alertUser("Youare no longer a memeber please exit leave the channel page");
    })
    .catch((data) => {
        console.log("issue in leave",data);
    })

}

// Add description of channel on channel age 
function addDescription (data,channel_id) {

    // Extract paticular sections from data
    let creator = data['creator'];
    let privatech = data['private'];
    let description = data['description'];
    let createdAt = data['createdAt'];
    let userFreindly = createdAt.split("T")[0];
    let name = data['name'];
    let channelInfor = "Name: " +name + ", Creator: " + creator + ", Private: " +privatech
    + ", Description: " + description + ", Created at: " + userFreindly;

    document.getElementById('Welcome_mess').style.display= 'none';
    hideElements('Description',"Not_member")

    document.getElementById('DName').innerText = channelInfor;

    // Option for user to leave channel 
    let btn = document.createElement("button");
    btn.innerText = "Leave " + name;
    btn.setAttribute("id", "Leave_"+name);
    btn.setAttribute('class', "btn btn-danger");
    document.getElementById('DName').appendChild(btn);

    let inv = document.createElement("btn");
    inv.innerText = "Invite other users";
    inv.setAttribute("id", "Invite"+channel_id);
    inv.setAttribute('class', "btn btn-primary");
    document.getElementById('DName').appendChild(inv);

    document.getElementById("Leave_"+name).addEventListener(('click'), () => {
        user_Leave_Channel(channel_id);
    })

    document.getElementById("Invite"+channel_id).addEventListener(('click') , ()=> {
        inviteUsers(channel_id);
    })
}

// Remove all child nodes of a parent node
function removeChild(parent) {

    const myNode = document.getElementById(parent);
    while (myNode.lastElementChild) {
        myNode.removeChild(myNode.lastElementChild);
    }
}

function displayOtherProfile(u_id) {

    let path = "user/" + u_id;

    APIFetchGet('GET', path,TOKEN)
    .then((other_user) => {
        let name = "'"+ other_user['name'] + "'";
        let email = other_user['email'];
        let bio = other_user['bio'];
        let ProfPic = other_user['image'];
        if (bio == null) {
            bio = "No bio has been set";
        }
        if (ProfPic == null) {
            ProfPic = "default.png";
        }
        document.getElementById('nameProfileOther').innerText = name;
        document.getElementById('bioProfileOther').innerText = bio;
        document.getElementById('emailProfileOther').innerText =  email;
        document.getElementById('otherUserPic').src = ProfPic;

        hideElements('OtherUserProfile','bottom');
    })
}

// Send sever who to add to a channel
function inviteUsers(ch_id) {

    removeChild("user_options");

    let path = 'user';

    APIFetchGet('GET',path,TOKEN) 
    .then((usersInfo) => {
    
        let userList = usersInfo['users'];
        
        let id = userList.map(el => el.id * 1);
        
        let option_page = document.getElementById("user_options");

        for (let i in id){
            let opt = document.createElement("input");
            opt.setAttribute("type","checkbox");
            opt.setAttribute("name", "user_add")
            opt.setAttribute("id", "for_"+id[i]);
            opt.value = id[i];
            option_page.appendChild(opt);
            let lbl = document.createElement("label");
            lbl.setAttribute("for","for_"+id[i]);
            lbl.setAttribute("id", "select_"+id[i]);
            option_page.appendChild(lbl);
            getUserName(id[i],TOKEN,"select_"+id[i])
            
        }

        const myModal = new bootstrap.Modal(document.getElementById('user_Invite'));
        myModal.show();

        document.getElementById("list_invite").addEventListener(('click'), () => {
           let users = getSelectedCheckboxValues("user_add");
           console.log(users);
           serverInvite(users,ch_id);
        })

    })
}
// Using information invite user to channel
function serverInvite(usersList,cID) {
    for(let i in usersList) {
        let path = "channel/" + cID + "/" + "invite";
        // send int value instead of string
        let intvale = parseInt(usersList[i])
        let body = {
            userId : intvale,
        } 
        APIFetch("POST",path,TOKEN,body) 
        .then((data) => {
            console.log("added", data);
        })   
        .catch((data) => {
            alertUser(data);
        })
    }
}

// Senders profile image to message
function addIm(img,user_id){

    let path = "user/" + user_id
    const promisList = [];

    promisList.push(APIFetchGet('GET', path,TOKEN)
    .then((data) => {
        return(data['image']);
    })); 

    Promise.all(promisList)
    .then(data2 => {
        // set defualt pic
       if (data2[0] === null) {
          img.src ="default.png";
       }  else {
           img.src = data2[0];
       }
       img.style.height = '50px';
       img.style.width = '50px';
    })
}

// Adds relevent buttons to channel page 
function addReleventBtn(channel_id,parent_node) {

    // Add Option to check pinned messages
    const btnPin = document.createElement("button");
    btnPin.innerText = "Check Pinned";
    btnPin.setAttribute("id", "view_pinned");
    parent_node.appendChild(btnPin);

    document.getElementById('view_pinned').addEventListener(('click'),() => {
       viewpinnedMess(channel_id);
    })

    // Add option to send a message
    let btnSend = document.createElement("button");
    btnSend.innerText = "Send a new message";
    btnSend.setAttribute("id", "send_message");
    parent_node.appendChild(btnSend);

    document.getElementById('send_message').addEventListener(('click'),() => {
       sendMessage(channel_id);
        
    })

    // Add option to send 
    let btnImage = document.createElement("button");
    btnImage.innerText = "Send an Image";
    btnImage.setAttribute("id", "send_image");
    parent_node.appendChild(btnImage);
    document.getElementById('send_image').addEventListener('click', () => {
        channel_image(channel_id);
    })
}

// The function below has been adpated from the following code.
// Link https://stackoverflow.com/questions/4060004/calculate-age-given-the-birth-date-in-the-format-yyyymmdd
// get value of selected
function getSelectedCheckboxValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    let values = [];
    checkboxes.forEach((checkbox) => {
        values.push(checkbox.value);
    });
    return values;
}
// Close (btn) compose
document.getElementById('closeBtn').addEventListener('click', function() {
  document.querySelector('#compose-view').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archive').addEventListener('click', () => load_mailbox('archive'));

  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_mail;

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email(email='', flag='') {

  // Show compose view
  document.querySelector('#compose-view').style.display = 'block';

  if(flag === 'reply') {
    document.querySelector('#compose-recipients').value = email['sender'];
    const CheckMatch = email['subject'].match(/^(Re:)\s/) ? email['subject'] : `Re: ${email['subject']}`;
    document.querySelector('#compose-recipients').value = email["sender"];
    document.querySelector('#compose-subject').value = CheckMatch;
    const repliedEmails = `---On ${email['timestamp']} <${email['sender']}> wrote:\n${email['body']}`;
    document.querySelector('#compose-body').value = `\n\n\n\n\n\n\n` + repliedEmails;
    

  } else {
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#email-inbox').style.display = 'block';
  document.querySelector('#getEmail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelectorAll('.email-options').forEach(option => {
    option.style.display = 'none';
  });

  // Clear the table   
  document.querySelector('#email-inbox').innerHTML = '';

  // Clear the getEmail div
  document.querySelector('#getEmail').innerHTML = '';

  // Show mailbox name
  document.querySelector("#email-inbox").innerHTML = `<h1>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h1>`;
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      ShowEmails(email, mailbox);
    });
  });
  
  // The name of the mailbox should appear at the top of the page
  history.pushState({section: "mailbox"}, "", `${mailbox}`);

}

// Show all the emails of the selected mailbox
function ShowEmails(email, mailbox) {

  const Inbox = document.querySelector('#email-inbox');
  const showMails = document.createElement('div');
  showMails.className = 'showMails';

  const sender = document.createElement('div');
  sender.className = 'showSender';
  sender.innerHTML = email["sender"];

  const subject = document.createElement('div');
  subject.className = 'showSubject';
  subject.innerHTML = `${email["subject"]} <span class="showBody">- ${email["body"]}</span>`;

  const timestamp = document.createElement('div');
  timestamp.className = 'showTimestamp';
  timestamp.innerHTML = email["timestamp"];

  const options = document.createElement('div');
  options.className = 'showOptions';
  options.style.display = 'none';

  const CheckRead = email.read ? `<i class="bi bi-envelope">` : `<i class="bi bi-envelope-open">`;
  const CheckTitle1 = email.read ? 'Mark as Unread' : 'Mark as Read'; 
  const MarkReadUnread = email.read ? false : true;
  const ReadUnread = document.createElement('a');
  ReadUnread.className = 'read-unread';
  ReadUnread.innerHTML = CheckRead;
  ReadUnread.title = CheckTitle1;
  ReadUnread.addEventListener('click', () => read_unread(email, MarkReadUnread));

  const CheckArchive = email['archived'] ? `<i class="bi bi-cloud-download"></i>`: `<i class="bi bi-cloud-upload"></i>`;
  const CheckTitle2 = email['archived'] ? 'Move to Inbox' : 'Archive';
  const ArchiveUnarchive = document.createElement('a');
  ArchiveUnarchive.className = 'archive';
  ArchiveUnarchive.innerHTML = CheckArchive;
  ArchiveUnarchive.title = CheckTitle2;
  ArchiveUnarchive.addEventListener('click', () => archive_unarchive(email, email['archived'] ? false : true));

  const Reply = document.createElement('a');
  Reply.className = 'reply';
  Reply.innerHTML = `<i class="bi bi-reply-fill"></i>`;
  Reply.title = 'Reply';
  Reply.addEventListener('click', () => compose_email(email, 'reply'));

  // Change background and font weight of read emails.
  const ReadBackground = email['read'] ? '#e9e9e9' : 'white';
  const ReadFont = email['read'] ? '400' : '700';
  
  if(mailbox === 'inbox') {
    sender.innerHTML = email['sender'];
    showMails.style.background = ReadBackground;
    showMails.style.fontWeight = ReadFont;

  } else if(mailbox === 'archive') {
    sender.innerHTML = email['sender'];
    showMails.style.background = ReadBackground;
    showMails.style.fontWeight = ReadFont;

    const ArchiveOptions = [ReadUnread, Reply];
    ArchiveOptions.forEach(data => {
      data.style.display = 'none';
    });

  } else {
    sender.innerHTML = `To: ${email['recipients']}`;
    const SentOptions = [ReadUnread, ArchiveUnarchive, Reply];
    showMails.style.background = "#e9e9e9";
    showMails.style.fontWeight = "400";

    SentOptions.forEach(data => {
      data.style.display = 'none';
    });
  }

  // Show Options on hover
  if(mailbox === 'inbox' || mailbox === 'archive') {
    showMails.addEventListener('mouseover', () => {
      options.style.display = 'inline-block';
      timestamp.style.display = 'none';
    })
    showMails.addEventListener('mouseout', () => {
      options.style.display = 'none';
      timestamp.style.display = 'inline-block';
    })  
  } else {
    timestamp.style.display = 'inline-block';
  }

  options.append(ArchiveUnarchive, ReadUnread, Reply);
  showMails.append(sender, subject, timestamp, options);
  Inbox.append(showMails);

  // Make the row clickable
  const td = [sender, subject, timestamp];
  td.forEach(data => {
    data.addEventListener('click', function() {
      read_email(email, mailbox);
    });
  });
}

function send_mail() {
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    }),
  })
  .then(response => response.json())
  .then(result => {
    if (result['error']) {
      const errorMsg = document.querySelector('#error-msg');
      errorMsg.style.display = 'inline-block';
      errorMsg.innerHTML = result['error'];

    } else {
      load_mailbox('sent');
    }
  });
  return false;
}

function read_email(email, mailbox) {

  // Hide others views
  document.querySelector('#email-inbox').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show email view
  document.querySelector('#getEmail').style.display = 'block';

  document.querySelector('#nav-top').innerHTML = '';

  // Get the email
  fetch(`/emails/${email['id']}`)
  .then(response => response.json())
  .then(result => {

    const title = document.createElement('div');
    title.className = 'subject-title';
    title.innerHTML = `<h1>${result['subject']}</h1>`
  
    const info = document.createElement('div');
    info.className = 'info';
  
    const from = document.createElement('p');
    from.className = 'from-section';
    from.innerHTML = `From: <span>${result['sender']}</span>`;
  
    const to = document.createElement('p');
    to.className = 'to-section';
    to.innerHTML = `To: <span>${result['recipients']}</span>`;
  
    const date = document.createElement('p');
    date.className = 'date-section';
    date.innerHTML = `Date: <span>${result['timestamp']}</span>`;
  
    const subject = document.createElement('p');
    subject.className = 'subject-section';
    subject.innerHTML = `Subject: <span>${result['subject']}</span>`;
  
    const body = document.createElement('div');
    body.id = 'body-section';
    body.disabled = true;
    body.innerHTML = result["body"];
  
    info.append(from, to, date, subject);
    document.querySelector('#getEmail').append(title, info, body);

    // Show options when viewing an email
    const CheckArchive = result['archived'] ? `<i class="bi bi-cloud-download"></i>` : `<i class="bi bi-cloud-upload"></i>`;
    const CheckTitle = result['archived'] ? 'Move to Inbox' : 'Archive';
    const viewArchive = document.createElement('div');
    viewArchive.className = 'email-options';
    viewArchive.id = 'view-archive';
    viewArchive.innerHTML = CheckArchive;
    viewArchive.title = CheckTitle;
    viewArchive.addEventListener('click', () => archive_unarchive(result, result['archived'] ? false : true));

    const viewReply = document.createElement('div');
    viewReply.className = 'email-options';
    viewReply.id = 'view-reply';
    viewReply.title = 'Reply';
    viewReply.innerHTML = `<i class="bi bi-reply-fill"></i>`;
    viewReply.addEventListener('click', () => compose_email(result, 'reply'));  

    document.querySelector('#nav-top').append(viewArchive, viewReply);

    // Show options only in Inbox or Archive
    if(mailbox === 'inbox') {
      document.querySelectorAll('.email-options').forEach(option => {
        option.style.display = 'inline-block';
      });
    } else if(mailbox === 'archive'){
      document.querySelector('#view-archive').style.display = 'inline-block'
    } else {
      document.querySelectorAll('.email-options').forEach(option => {
        option.style.display = 'none';
      });
    }
  });

  fetch(`/emails/${email['id']}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });

}

// Mark as read/unread
function read_unread(email, boolean) {

  fetch(`/emails/${email['id']}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: boolean
    })
  })
  .then(() => load_mailbox('inbox'));
}

function archive_unarchive(email, boolean) {

  fetch(`/emails/${email['id']}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: boolean,
      read: true
    })
  })
  .then(() => load_mailbox('inbox'));
}
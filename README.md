
# Conference Time

Conference Time is a platform that helps you create time efficient meetings and conferences by providing a lot of features.


## Features

- Host Meeting
- Join Meeting
- Realtime Chat
- Screen Sharing
- Short Meetings
- Regular Reminders
- Transcription



## Tech Stack

**Client:**  HTML , CSS , Javascript

**Server:** Django, Python , Agora api


## Documentation

A user can host a meeting and share meeting code to others . 

A user can join the meeting using the meeting code.

Host can create a meeting of duration 15 Minutes , 30 Minutes or 45 Minutes.

5 Minutes before the end of meeting the users get a remider and a button shows on host panel to increase the meeting time.

On clicking that button a poll appears on all the users whether they want to increase the meeting or not.

If more than 50 percent of the users click "yes" the meeting will extend 5 minutes.

Otherwise meeting will end on the original timing.

The meeting can be extended atmost 2 times with duration of 5 Minutes each.

To prevent missing important part , a transcription service is provided.
## Deployment

To run this project locally


Navigate to conference time main folder


Run the following commands.
```bash
  python manage.py makemigrations
```
```bash
  python manage.py migrate
```
```bash
  python manage.py runserver
```

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

A start button is present on the host panel.

If the host click on that button , a notification appears on remote users to pay attention as reminder for important topic.

Moreover a speech Recognition is started which trasncripts the user voice to text until the stop button is pressed on the admin panel.

After completetion the transcrbed text is made available on the important section for all users.

This feature helps preventing extension of meeting because of the users that do not pay attention to meeting.
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

## Screenshots

<img width="960" alt="first" src="https://user-images.githubusercontent.com/54182371/187076159-4dff48a7-e0b9-4a7f-9f89-e0eca98bc42c.png">
<img width="960" alt="second" src="https://user-images.githubusercontent.com/54182371/187076166-244502d6-88f1-4fa8-b615-66b59858bba4.png">
<img width="960" alt="third" src="https://user-images.githubusercontent.com/54182371/187076211-eacb0690-9db7-42bb-96d9-78035f02fcd5.png">
<img width="960" alt="fourth" src="https://user-images.githubusercontent.com/54182371/187076214-eef5d219-f5fc-4fbf-a463-d5bc36f66979.png">
<img width="960" alt="fifth" src="https://user-images.githubusercontent.com/54182371/187076182-98022a39-e803-43c0-98c4-4ec9b136b32e.png">
<img width="960" alt="six" src="https://user-images.githubusercontent.com/54182371/187076226-40823771-6a99-41c0-8a11-03dd7df9543b.png">


## YouTube Video
Demonstration of the project is given on YouTube.

[<img width="960" alt="first" src="https://user-images.githubusercontent.com/54182371/187076755-8e5502d7-f44e-4877-adbc-c97af556d95d.png">](https://youtu.be/ahxC3w4U7e4)

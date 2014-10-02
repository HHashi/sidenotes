# Manual Tests For Sidenotes Workflow

      - FINAL   [ ] Make sure the extensions installs correctly from the Chrome store
1. [X] Check the sign-in workflow.
      -    [X] It should then redirect to the tutorial/landing page
          - **EDIT: BUG FIXED** BUG: signing in and out multiple times causes problems with the sign in button in the popup and the toggle close of the sidepanel(mostly fixed actually, it happens very rarely but the cause is processes happening after log out that you can interrupt by signing in and out quickly multiple times)

2. [X] Hotkey and button toggle sidebar
    - [X] You shouldn't be able to toggle unless you're logged in.
      - Note: related issues to the aforementioned bug, but it's working if you don't sign in and out multiple times

3. [X] Textarea changes should autosave to local storage.
    - [X] Indicator light is yellow when saving and green when saved.
4. [X] Dropbox datastore record should be updated instantly with the most recent edit of the note for a certain url
5. [X] Datastore should return most recent note to chrome storage based on url
6. [X] Textarea should be populated with most recent note upon toggle open
7. [X] Check that the textarea populates correctly between tabs (and computers)
    - **EDIT: BUG FIXED** BUG: Between computers signed in on the same account, it doesn't currently update in real-time w/o refreshing.
8. [X] Search page should return correct results based on input
9. [X] Menu buttons on sidebar are functional

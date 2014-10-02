# Manual Tests For Sidenotes Workflow

1. [ ] Check the sign-in workflow.
    -    [ ] Once in the Chrome store:
        -    [ ] Make sure the extensions installs correctly
        -    [X] It should then redirect to the tutorial/landing page
          - **EDIT: BUG FIXED** BUG: signing in and out multiple times causes problems with the sign in button in the popup and the toggle close of the sidepanel)

2. [ ] Hotkey and button toggle sidebar
    - [ ] You shouldn't be able to toggle unless you're logged in.

3. [X] Textarea changes should autosave to local storage.
    - [X] Indicator light is yellow when saving and green when saved.
4. [X] Dropbox datastore record should be updated instantly with the most recent edit of the note for a certain url
5. [X] Datastore should return most recent note to chrome storage based on url
6. [X] Textarea should be populated with most recent note upon toggle open
7. [ ] Check that the textarea populates correctly between tabs/computers
8. [X] Search page should return correct results based on input
9. [X] Menu buttons on sidebar are functional

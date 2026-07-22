Feature: New user appears as a regular user
  As a QA engineer
  I want to validate user creation from the UI
  So that new users are visible in the list with the expected role

  Scenario: New user appears in the user list as a regular user
    Given I have valid unique user details
    When I create a new user through the create-user form
    Then I should be redirected to the user list
    And I should see the new user in the list with the correct name and email
    And the new user should be shown as a regular user

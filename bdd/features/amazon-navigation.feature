Feature: Amazon navigation
  As an Amazon user
  I want to navigate various pages on Amazon
  So that I can find products and information easily

  Scenario: User navigates various pages successfully
    Given I begin on the Amazon homepage
    Then I should be able to click on the accept cookie button
    And click on the 'Best Sellers' link
    And click on the 'Devices and Accessories' link on the left
    And click on the back button
    And click on 'Apps and Games'
    And click on back again
    And arrive back on the homepage
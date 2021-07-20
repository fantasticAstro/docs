---
title: Getting started with GitHub Team
intro: 'With {% data variables.product.prodname_team %} groups of people can collaborate across many projects at the same time in an organization account.'
versions:
  fpt: '*'
---

This guide will walk you through setting up, configuring and managing your {% data variables.product.prodname_team %} account as an organization owner.

## Part 1: Configuring your {% data variables.product.product_name %} account
As the first steps in starting with {% data variables.product.prodname_team %}, you will need to create a user account or log into your existing account on {% data variables.product.prodname_dotcom %}, create an organization, and set up billing.

### 1. About organizations
Organizations are shared accounts where businesses and open-source projects can collaborate across many projects at once. Owners and administrators can manage member access to the organization's data and projects with sophisticated security and administrative features. For more information on the features of organizations, see "[About organizations](/organizations/collaborating-with-groups-in-organizations/about-organizations#terms-of-service-and-data-protection-for-organizations)."

### 2. Creating an organization and signing up for {% data variables.product.prodname_team %}
Before creating an organization, you will need to create a user account or log in to your existing {% data variables.product.prodname_dotcom %} account. For more information, see "[Signing up for a new {% data variables.product.prodname_dotcom %} account](/get-started/signing-up-for-github/signing-up-for-a-new-github-account)."

Once your user account is set up, you can create an organization and pick a plan. This is where you can choose a {% data variables.product.prodname_team %} subscription for your organization. For more information, see "[Creating a new organization from scratch](/organizations/collaborating-with-groups-in-organizations/creating-a-new-organization-from-scratch)."

### 3. Managing billing for an organization
You must manage billing settings, payment method, and paid features and products for each of your personal accounts and organizations separately. You can switch between settings for your different accounts using the context switcher in your settings. For more information, see "[Switching between settings for your different accounts](/billing/managing-your-github-billing-settings/about-billing-on-github#switching-between-settings-for-your-different-accounts)."

Your organization's billing settings page allows you to manage settings like your payment method, billing cycle and billing email, or view information such as your subscription, billing date and payment history. You can also view and upgrade your storage and GitHub Actions minutes. For more information on managing your billing settings, see "[Managing your {% data variables.product.prodname_dotcom %} billing settings](/billing/managing-your-github-billing-settings)."

Only organization members with the *owner* or *billing manager* role can access or change billing settings for your organization. A billing manager is someone  who manages the billing settings for your organization and does not use a paid license in your organization's subscription. For more information on adding a billing manager to your organization, see "[Adding a billing manager to your organization](/organizations/managing-peoples-access-to-your-organization-with-roles/adding-a-billing-manager-to-your-organization)."


## Part 2: Adding members and setting up teams
After creating your organization, you can invite members and set permissions and roles. You can also create different levels of teams and set customized levels of permissions for your organization's repositories, project boards, and apps.

### 1. Managing members of your organization
You can invite anyone to be a member of your organization, as long as they have a personal account on GitHub. You can also remove members and reinstate former members. For more information, see "[Managing membership in your organization](/organizations/managing-membership-in-your-organization)."

Organization members can stay up-to-date with recent activity or keep track of issues and pull requests by visiting the organization dashboard. For more information, see "[About your organization dashboard](/organizations/collaborating-with-groups-in-organizations/about-your-organization-dashboard)."
### 2. Organization permissions and roles
Each person in your organization has a role that defines their level of access to the organization. The member role is the default, and you can assign owner and billing manager roles as well as "team maintainer" permissions. For more information, see "[Permission levels for an organization](/organizations/managing-peoples-access-to-your-organization-with-roles/permission-levels-for-an-organization)."

### 3. About and creating teams
Teams are groups of organization members that you can create to reflect your company or group's structure with cascading access permissions and mentions. Organization members can send notifications to a team or request reviews, and teams can be visible or secret. For more information, see "[About teams](/organizations/organizing-members-into-teams/about-teams)."

You can create independent teams or have multiple levels of nested teams to reflect your group or company's hierarchy. For more information, see "[Creating a team](/organizations/organizing-members-into-teams/creating-a-team)."
### 4. Managing team settings
You can designate a "team maintainer" to manage team settings and discussions, among other privileges. For more information, see "[Giving "team maintainer" permissions to an organization member](/organizations/managing-peoples-access-to-your-organization-with-roles/giving-team-maintainer-permissions-to-an-organization-member)."

You can manage code review assignments for your team, change team visibility, manage scheduled reminders for your team, and more in your team's settings. For more information, see "[Organizing members into teams](/organizations/organizing-members-into-teams)."

### 5. Giving people and teams access to repositories, project boards and apps
You can give organization members, teams, and outside collaborators different levels of access to repositories owned by your organization with granular permission levels. For more information, see "[Repository permission levels for an organization](/organizations/managing-access-to-your-organizations-repositories/repository-permission-levels-for-an-organization)."

You can also customize access to your organization's project boards and allow individual organization members to manage your organization's GitHub Apps. For more information, see "[Managing access to your organization's project boards](/organizations/managing-access-to-your-organizations-project-boards)" and "[Managing access to your organization's apps](/organizations/managing-access-to-your-organizations-apps)."
## Part 3: Managing security for your organization
You can help to make your organization more secure by recommending or requiring two-factor authentication for your organization members, configuring security features, and reviewing your organization's audit log and integrations.

### 1. Requiring two-factor authentication
You can view whether your organization members have two-factor authentication enabled and choose to require two-factor authentication in your organization. For more information, see "[Requiring two-factor authentication in your organization](/organizations/keeping-your-organization-secure/requiring-two-factor-authentication-in-your-organization)."

### 2. Configuring security features for your organization
You can use a variety of GitHub security features, including security policies, dependency graphs, secret scanning and Dependabot security and version updates, to keep your organization secure. For more information, see "[Securing your organization](/code-security/getting-started/securing-your-organization)" and "[Managing security and analysis settings for your organization](/organizations/keeping-your-organization-secure/managing-security-and-analysis-settings-for-your-organization)."

### 3. Reviewing your organization's audit log and integrations
The audit log for your organization allows you, as an organization owner, to review the actions performed by members of the organization within the last 90 days. For more information, see "[Reviewing the audit log for your organization](/organizations/keeping-your-organization-secure/reviewing-the-audit-log-for-your-organization)."

You can also review and configure the permission levels for your organization's installed integrations. For more information, see "[Reviewing your organization's installed integrations](/organizations/keeping-your-organization-secure/reviewing-your-organizations-installed-integrations)."

## Part 4: Setting organization level policies
### 1. Managing organization policies
You can manage permissions and policies for a number of different actions and features in your organization.

For example, to protect your organization's data and number of paid licenses, you can choose to allow only organization owners to invite outside collaborators to organization repositories. You can also choose to allow or prevent the forking of private repositories owned by your organization. For more information, see "[Setting permissions for adding outside collaborators](/organizations/managing-organization-settings/setting-permissions-for-adding-outside-collaborators)" and "[Managing the forking policy for your organization](/organizations/managing-organization-settings/managing-the-forking-policy-for-your-organization)."

For the full list of settings you can configure for your organization, see "[Managing organization settings](/organizations/managing-organization-settings)."
### 2. Managing repository changes
You can configure permissions for creating, transferring and deleting repositories in your organization, including which types can be created by members. For more information, see "[Restricting repository creation in your organization](/organizations/managing-organization-settings/restricting-repository-creation-in-your-organization)" and "[Setting permissions for deleting or transferring repositories](/organizations/managing-organization-settings/setting-permissions-for-deleting-or-transferring-repositories)."

You can also restrict or grant the ability to change repository visibility. For more information, see "[Restricting repository visibility changes in your organization](/organizations/managing-organization-settings/restricting-repository-visibility-changes-in-your-organization)."
### 3. Using organization-level community health files and moderation tools
You can create default community health files, such as a CONTRIBUTING.md file, a CODE_OF_CONDUCT.md file, or even issue and pull request templates, for your organization. These default files will be used for any repository owned by your organization that does not contain its own file of that type. 

GitHub offers multiple tools for moderating and managing your community. For more information, see "[Tools for moderating your community](/communities/setting-up-your-project-for-healthy-contributions/about-community-management-and-moderation#tools-for-moderating-your-community)."
## Part 5: Customizing and automating your work on {% data variables.product.product_name %}

{% data reusables.getting-started.customizing-and-automating %}
### 1. Using {% data variables.product.prodname_marketplace %}
{% data reusables.getting-started.marketplace %}
### 2. Using the {% data variables.product.prodname_dotcom %} API
{% data reusables.getting-started.api %}

### 3. Building {% data variables.product.prodname_actions %}
{% data reusables.getting-started.actions %}

### 4. Publishing and managing {% data variables.product.prodname_registry %} 
{% data reusables.getting-started.packages %}

### 5. Using {% data variables.product.prodname_pages %}
{% data reusables.getting-started.github-pages %}

## Part 6: Participating in {% data variables.product.prodname_dotcom %}'s community
{% data reusables.getting-started.participating-in-community %}
### 1. Contributing to open source projects
{% data reusables.getting-started.open-source-projects %}

### 2. Interacting with the {% data variables.product.prodname_gcf %}
{% data reusables.support.ask-and-answer-forum %}

### 3. Learning with {% data variables.product.prodname_learning %}
{% data reusables.getting-started.learning-lab %}

### 4. Supporting the open source community
{% data reusables.getting-started.sponsors %}

### 5. Contacting {% data variables.contact.github_support %}
{% data reusables.getting-started.contact-support %}
## Further reading

- "[Getting started with your GitHub account](/get-started/onboarding/getting-started-with-your-github-account)"

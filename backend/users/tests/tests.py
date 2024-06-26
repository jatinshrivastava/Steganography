# # from django.core.urlresolvers import reverse
# from django.urls import reverse
# from rest_framework.test import APITestCase
# from django.contrib.auth import get_user_model
# from rest_framework import status
#
# User = get_user_model()
# class AccountsTest(APITestCase):
#     def setUp(self):
#         # We want to go ahead and originally create a user.
#
#         self.test_user = User.objects.create_user('test@example.com', 'test', 'name', 'testpassword')
#
#         # URL for creating an account.
#         self.create_url = reverse('account-create')
#
#     def test_create_user(self):
#         """
#         Ensure we can create a new user and a valid token is created with it.
#         """
#         data = {
#             'username': 'foobar',
#             'email': 'foobar@example.com',
#             'password': 'somepassword',
#             'firstname': 'foo',
#             'lastname': 'bar',
#         }
#
#         print(f'url is {self.create_url}')
#         response = self.client.post(self.create_url, data, format='json')
#         # We want to make sure we have two users in the database..
#         self.assertEqual(User.objects.count(), 2)
#         # And that we're returning a 201 created code.
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         # Additionally, we want to return the username and email upon successful creation.
#         self.assertEqual(response.data['username'], data['username'])
#         self.assertEqual(response.data['email'], data['email'])
#         self.assertEqual(response.data['firstname'], data['firstname'])
#         self.assertEqual(response.data['lastname'], data['lastname'])
#         self.assertFalse('password' in response.data)

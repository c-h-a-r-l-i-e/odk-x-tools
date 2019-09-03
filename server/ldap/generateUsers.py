#!/usr/bin/env python3

"""
Author: Charlie Maclean

This program automatically generates 200 user accounts, with a random password, and outputs:
    - an LDIF file which can be input into PHP LDAP admin
    - a text file containing all the users and passwords
"""

import base64
import json
import hashlib
import os
import random
import base64
import binascii
systemRandom = random.SystemRandom()
words = json.loads(open("wordlist.json", 'r').read())


class User:
    def __init__(self, username, usernumber):
        self.username = username
        self.usernumber = usernumber
        self.password = self.generatePassword()

    def getUserName(self):
        return self.username

    def getUserNumber(self):
        return self.usernumber

    def generatePassword(self):
        word = systemRandom.choice(words)
        num = systemRandom.randrange(1000, 10000)
        return ("{}{}".format(word, num))

    def getPasswordHash(self):
        digest = hashlib.md5(self.password.encode('UTF-8')).digest()
        out = base64.b64encode(digest).decode("UTF-8")
        return out


    def outputLDIF_string(self):
        out = """dn: uid={0},ou=people,dc=example,dc=org
changetype: add
uid: {0}
cn: {0}
sn: survey account
gidNumber: 503
uidNumber: {1}
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
userPassword: {{md5}}{2}
homeDirectory: /home/users/{0}
""".format(self.username, self.usernumber, self.getPasswordHash())
        return out

    def outputTxt_string(self):
        out = "username: {0}\npassword: {1}\n".format(self.username, self.password)
        return out


def generateAccounts():
    users = []
    for i in range(100, 301):
        users.append(User("user{}".format(i), i))

    LDIF_string = ""
    txt_string = ""
    for user in users:
        LDIF_string += user.outputLDIF_string() + "\n"
        txt_string += user.outputTxt_string() + "\n"
    
    # Add the users to the group (group 503 allows users to synchnronise tables)
    LDIF_string += """dn: gidNumber=503,ou=default_prefix,ou=groups,dc=example,dc=org
changetype: modify
add: memberUid
"""
    for user in users:
        LDIF_string += "memberUid: {}\n".format(user.getUserName())



    with open("users.ldif", "w") as ldif_file:
        ldif_file.write(LDIF_string)

    with open("users.txt", "w") as text_file:
        text_file.write(txt_string)

if __name__ == "__main__":
    generateAccounts()

# Contributing to 2factorauth

![](https://img.shields.io/badge/Difficulty-Medium-yellow?style=for-the-badge)

## Requirements

* Basic knowledge of GitHub and the Git workflow process.
* A GitHub account and access to a computer/tablet.

## Submitting a new entry

### Definitions

For an entry to be classified as supporting 2FA it needs to:  
1. Ask for the second factor during the login phase and not just when the user performs certain actions.
1. Offer multi factor authentication to all users.
1. Enforce mutli factor authentication at every login or every login from new devices.

### Creating a JSON-file

1. Go to `entries/` and to the subdirectory corresponding to the first letter of your entrys domain name.  
In this example we will use `example.com` and thus `entries/e/` will be our 
correct directory.

1. Now add a new file. On GitHub.com, the button will be on the top right.  
	![](https://d.carlgo11.com/D600B70EC50C85/?p=0UIYEjyZ1MzlXBTsRf)

1. Let the file name be the entries domain name and the file extension YML.  
	 In this example, the full name will be `example.com.yml`. 

### JSON-text

The file syntax is as follows:
```JSON
{
	"Example": {
    "domain": "example.com"
	}
}
```

#### 2FA methods

We currently list the following authentication factors:
* SMS
* Phone (calls)
* Email
* TOTP (RFC-6238)
* U2F
* Custom hardware and software solutions

##### **Custom solutions**

```JSON
"custom-hardware": ["Yubikey"]
"custom-software": ["Authy", "Duo"]
```

#### Contact methods

If the entry doesn't support tfa it's great if we can direct customers on how to contact the company and ask them to implement tfa. We therefore need different contact methods.

##### **Email Address**

The email contact method is meant to be used to direct customers to the company's customer service/feedback. Please don't specify email addresses to specific people in the company (like the CEO or other administrative staff).

```JSON
"contact": {
	"email": "support@example.com"
}
```

##### **Facebook**

```JSON
"contact": {
	"facebook": "example"
}
```

##### **Twitter**
```JSON
"contact": {
	"twitter": "example"
}
```


#### Regions of operation


#### 2FA and recovery documentation


### Entry logo

Each entry needs a logo. We prefer SVG files as vectored graphics often look much better than rasterized graphics when dealing with logos.  
We also support the PNG format as long as the image is sized 128 x 128 pixels and reasonably compressed.  


## Sites not covered by 2factorauth

1. Entries with an Alexa score deemed too high.
1. Content deemed __illegal__ under UN and EU laws.
1. Entries primarily serving __Pornographic content__.
1. Entries assosciated with __hatespeech, harassment__ or other conducts listed in our [Code of Conduct](CODE_OF_CONDUCT.md).

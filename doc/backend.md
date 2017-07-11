# Running a black-box backend server with authentication modules

(This document needs some work.)

Just do these four commands:

```
$ mkdir auth-blackbox
$ cd auth-blackbox
$ vagrant init --minimal folio/folio-backend-auth
$ vagrant up
```

The result should be something like this:

```
mike@thor:~/git/work$ mkdir auth-blackbox
mike@thor:~/git/work$ cd auth-blackbox
mike@thor:~/git/work/auth-blackbox$ vagrant init --minimal folio/folio-backend-auth
A `Vagrantfile` has been placed in this directory. You are now
ready to `vagrant up` your first virtual environment! Please read
the comments in the Vagrantfile as well as documentation on
`vagrantup.com` for more information on using Vagrant.
mike@thor:~/git/work/auth-blackbox$ vagrant up
Bringing machine 'default' up with 'virtualbox' provider...
==> default: Box 'folio/folio-backend-auth' could not be found. Attempting to find and install...
    default: Box Provider: virtualbox
    default: Box Version: >= 0
==> default: Loading metadata for box 'folio/folio-backend-auth'
    default: URL: https://atlas.hashicorp.com/folio/folio-backend-auth
==> default: Adding box 'folio/folio-backend-auth' (v0.5.0) for provider: virtualbox
    default: Downloading: https://atlas.hashicorp.com/folio/boxes/folio-backend-auth/versions/0.5.0/providers/virtualbox.box
==> default: Successfully added box 'folio/folio-backend-auth' (v0.5.0) for 'virtualbox'!
==> default: Importing base box 'folio/folio-backend-auth'...
==> default: Matching MAC address for NAT networking...
==> default: Checking if box 'folio/folio-backend-auth' is up to date...
==> default: Setting the name of the VM: auth-blackbox_default_1488389638692_12141
==> default: Clearing any previously set network interfaces...
==> default: Preparing network interfaces based on configuration...
    default: Adapter 1: nat
==> default: Forwarding ports...
    default: 9130 (guest) => 9130 (host) (adapter 1)
    default: 22 (guest) => 2222 (host) (adapter 1)
==> default: Booting VM...
==> default: Waiting for machine to boot. This may take a few minutes...
    default: SSH address: 127.0.0.1:2222
    default: SSH username: vagrant
    default: SSH auth method: private key
==> default: Machine booted and ready!
==> default: Checking for guest additions in VM...
    default: No guest additions were detected on the base box for this VM! Guest
    default: additions are required for forwarded ports, shared folders, host only
    default: networking, and more. If SSH fails on this machine, please install
    default: the guest additions and repackage the box to continue.
    default:
    default: This is not an error message; everything may continue to work properly,
    default: in which case you may ignore this message.
```

You will then be able to contact Okapi on port 9130, and ask it what modules it is running on http://localhost:9130/_/proxy/modules

If you need to log into the virtual machine that is running Okapi and the modules, use `vagrant ssh`.


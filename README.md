# motion.js


This is very much a work in progress. The sections below detail
where I would like to see this library go.

## Realtime Object Synchronization

Based on the techniques:

  * http://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking
  * http://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization

motion.js provides a platform for realtime synchronization between
multiple clients and authoritative server(s).  This is accomplished by
the following sections.

## Overview

While the server is running it is simulating a scene, it is periodically
taking snapshots of the changes that have occurred to the scene since the
last snapshot.  These snapshots (see: Delta Compression) are pushed to
all of the clients on a constant interval.

Meanwhile on the client, the same scene is being simulated.  On an interval
(affected by network latency) the client receives the latest snapshot
from the server and applies (over time) the changes that have occurred
to the scene on the server on the local scene.  In other words, the
client's scene is continually trying to catch up with the server's scene.

If there are entities in the client's scene that the user can control,
each of the actions performed by the client are queued and pushed to the
client on a regular interval.  When the server receives these commands
it looks back in time to ensure that the each of the client's commands
would have been valid when they were created.  If the current command is
valid, the command/action is applied to the servers and the client is
notified that the command was successful on the next snapshot.

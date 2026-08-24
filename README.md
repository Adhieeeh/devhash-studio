#  DevHash (React)
----------------------------------------------------------------------------------
# Distributed Consistent Hashing & Ring Sharding Studio
DevHash is an interactive distributed systems laboratory and Consistent Hashing ring simulator built with React. It models the core partitioning algorithms powering distributed databases and cache clusters (Amazon DynamoDB, Apache Cassandra, Memcached, Cloudflare): continuous $360^\circ$ token ring mapping, configurable Virtual Nodes (vnodes), minimal $O(K/N)$ key rebalancing on cluster mutations, and clockwise coordinator routing traces.

##  Technical Architecture Overview
---------------------------------------------------------------------------------

*  **Continuous Token Ring ($360^\circ$ Space):** Hashes physical server nodes and partition keys into a circular token space using deterministic string hashing.
*  **Virtual Node (VNode) Balancing:** Allocates configurable vnode slices per physical node to ensure uniform hash distribution and eliminate data hotspot skews.
*  **Minimal Rebalance Scaling:** Demonstrates zero-downtime cluster mutations where adding/draining nodes only moves $O(K/N)$ keys instead of triggering global reshuffles.
*  **Clockwise Coordinator Routing:** Computes clockwise boundary searches to resolve the coordinator replica node for any partition key.

##  Preview
--------------------------------------------------------------------
![](devh




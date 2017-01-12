/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var exported = {
	  'fbp-graph': __webpack_require__(1)
	};

	if (window) {
	  window.require = function (moduleName) {
	    if (exported[moduleName]) {
	      return exported[moduleName];
	    }
	    throw new Error('Module ' + moduleName + ' not available');
	  };
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	exports.graph = __webpack_require__(2);
	exports.Graph = exports.graph.Graph;

	exports.journal = __webpack_require__(14);
	exports.Journal = exports.journal.Journal;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var EventEmitter, Graph, clone, mergeResolveTheirsNaive, platform, resetGraph,
	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	    hasProp = {}.hasOwnProperty;

	  EventEmitter = __webpack_require__(3).EventEmitter;

	  clone = __webpack_require__(4);

	  platform = __webpack_require__(9);

	  Graph = (function(superClass) {
	    extend(Graph, superClass);

	    Graph.prototype.name = '';

	    Graph.prototype.caseSensitive = false;

	    Graph.prototype.properties = {};

	    Graph.prototype.nodes = [];

	    Graph.prototype.edges = [];

	    Graph.prototype.initializers = [];

	    Graph.prototype.exports = [];

	    Graph.prototype.inports = {};

	    Graph.prototype.outports = {};

	    Graph.prototype.groups = [];

	    function Graph(name1, options) {
	      this.name = name1 != null ? name1 : '';
	      if (options == null) {
	        options = {};
	      }
	      this.properties = {};
	      this.nodes = [];
	      this.edges = [];
	      this.initializers = [];
	      this.exports = [];
	      this.inports = {};
	      this.outports = {};
	      this.groups = [];
	      this.transaction = {
	        id: null,
	        depth: 0
	      };
	      this.caseSensitive = options.caseSensitive || false;
	    }

	    Graph.prototype.getPortName = function(port) {
	      if (this.caseSensitive) {
	        return port;
	      } else {
	        return port.toLowerCase();
	      }
	    };

	    Graph.prototype.startTransaction = function(id, metadata) {
	      if (this.transaction.id) {
	        throw Error("Nested transactions not supported");
	      }
	      this.transaction.id = id;
	      this.transaction.depth = 1;
	      return this.emit('startTransaction', id, metadata);
	    };

	    Graph.prototype.endTransaction = function(id, metadata) {
	      if (!this.transaction.id) {
	        throw Error("Attempted to end non-existing transaction");
	      }
	      this.transaction.id = null;
	      this.transaction.depth = 0;
	      return this.emit('endTransaction', id, metadata);
	    };

	    Graph.prototype.checkTransactionStart = function() {
	      if (!this.transaction.id) {
	        return this.startTransaction('implicit');
	      } else if (this.transaction.id === 'implicit') {
	        return this.transaction.depth += 1;
	      }
	    };

	    Graph.prototype.checkTransactionEnd = function() {
	      if (this.transaction.id === 'implicit') {
	        this.transaction.depth -= 1;
	      }
	      if (this.transaction.depth === 0) {
	        return this.endTransaction('implicit');
	      }
	    };

	    Graph.prototype.setProperties = function(properties) {
	      var before, item, val;
	      this.checkTransactionStart();
	      before = clone(this.properties);
	      for (item in properties) {
	        val = properties[item];
	        this.properties[item] = val;
	      }
	      this.emit('changeProperties', this.properties, before);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addExport = function(publicPort, nodeKey, portKey, metadata) {
	      var exported;
	      if (metadata == null) {
	        metadata = {
	          x: 0,
	          y: 0
	        };
	      }
	      platform.deprecated('fbp-graph.Graph exports is deprecated: please use specific inport or outport instead');
	      if (!this.getNode(nodeKey)) {
	        return;
	      }
	      this.checkTransactionStart();
	      exported = {
	        "public": this.getPortName(publicPort),
	        process: nodeKey,
	        port: this.getPortName(portKey),
	        metadata: metadata
	      };
	      this.exports.push(exported);
	      this.emit('addExport', exported);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.removeExport = function(publicPort) {
	      var exported, found, i, idx, len, ref;
	      platform.deprecated('fbp-graph.Graph exports is deprecated: please use specific inport or outport instead');
	      publicPort = this.getPortName(publicPort);
	      found = null;
	      ref = this.exports;
	      for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
	        exported = ref[idx];
	        if (exported["public"] === publicPort) {
	          found = exported;
	        }
	      }
	      if (!found) {
	        return;
	      }
	      this.checkTransactionStart();
	      this.exports.splice(this.exports.indexOf(found), 1);
	      this.emit('removeExport', found);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addInport = function(publicPort, nodeKey, portKey, metadata) {
	      if (!this.getNode(nodeKey)) {
	        return;
	      }
	      publicPort = this.getPortName(publicPort);
	      this.checkTransactionStart();
	      this.inports[publicPort] = {
	        process: nodeKey,
	        port: this.getPortName(portKey),
	        metadata: metadata
	      };
	      this.emit('addInport', publicPort, this.inports[publicPort]);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.removeInport = function(publicPort) {
	      var port;
	      publicPort = this.getPortName(publicPort);
	      if (!this.inports[publicPort]) {
	        return;
	      }
	      this.checkTransactionStart();
	      port = this.inports[publicPort];
	      this.setInportMetadata(publicPort, {});
	      delete this.inports[publicPort];
	      this.emit('removeInport', publicPort, port);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.renameInport = function(oldPort, newPort) {
	      oldPort = this.getPortName(oldPort);
	      newPort = this.getPortName(newPort);
	      if (!this.inports[oldPort]) {
	        return;
	      }
	      this.checkTransactionStart();
	      this.inports[newPort] = this.inports[oldPort];
	      delete this.inports[oldPort];
	      this.emit('renameInport', oldPort, newPort);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.setInportMetadata = function(publicPort, metadata) {
	      var before, item, val;
	      publicPort = this.getPortName(publicPort);
	      if (!this.inports[publicPort]) {
	        return;
	      }
	      this.checkTransactionStart();
	      before = clone(this.inports[publicPort].metadata);
	      if (!this.inports[publicPort].metadata) {
	        this.inports[publicPort].metadata = {};
	      }
	      for (item in metadata) {
	        val = metadata[item];
	        if (val != null) {
	          this.inports[publicPort].metadata[item] = val;
	        } else {
	          delete this.inports[publicPort].metadata[item];
	        }
	      }
	      this.emit('changeInport', publicPort, this.inports[publicPort], before, metadata);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addOutport = function(publicPort, nodeKey, portKey, metadata) {
	      if (!this.getNode(nodeKey)) {
	        return;
	      }
	      publicPort = this.getPortName(publicPort);
	      this.checkTransactionStart();
	      this.outports[publicPort] = {
	        process: nodeKey,
	        port: this.getPortName(portKey),
	        metadata: metadata
	      };
	      this.emit('addOutport', publicPort, this.outports[publicPort]);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.removeOutport = function(publicPort) {
	      var port;
	      publicPort = this.getPortName(publicPort);
	      if (!this.outports[publicPort]) {
	        return;
	      }
	      this.checkTransactionStart();
	      port = this.outports[publicPort];
	      this.setOutportMetadata(publicPort, {});
	      delete this.outports[publicPort];
	      this.emit('removeOutport', publicPort, port);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.renameOutport = function(oldPort, newPort) {
	      oldPort = this.getPortName(oldPort);
	      newPort = this.getPortName(newPort);
	      if (!this.outports[oldPort]) {
	        return;
	      }
	      this.checkTransactionStart();
	      this.outports[newPort] = this.outports[oldPort];
	      delete this.outports[oldPort];
	      this.emit('renameOutport', oldPort, newPort);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.setOutportMetadata = function(publicPort, metadata) {
	      var before, item, val;
	      publicPort = this.getPortName(publicPort);
	      if (!this.outports[publicPort]) {
	        return;
	      }
	      this.checkTransactionStart();
	      before = clone(this.outports[publicPort].metadata);
	      if (!this.outports[publicPort].metadata) {
	        this.outports[publicPort].metadata = {};
	      }
	      for (item in metadata) {
	        val = metadata[item];
	        if (val != null) {
	          this.outports[publicPort].metadata[item] = val;
	        } else {
	          delete this.outports[publicPort].metadata[item];
	        }
	      }
	      this.emit('changeOutport', publicPort, this.outports[publicPort], before, metadata);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addGroup = function(group, nodes, metadata) {
	      var g;
	      this.checkTransactionStart();
	      g = {
	        name: group,
	        nodes: nodes,
	        metadata: metadata
	      };
	      this.groups.push(g);
	      this.emit('addGroup', g);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.renameGroup = function(oldName, newName) {
	      var group, i, len, ref;
	      this.checkTransactionStart();
	      ref = this.groups;
	      for (i = 0, len = ref.length; i < len; i++) {
	        group = ref[i];
	        if (!group) {
	          continue;
	        }
	        if (group.name !== oldName) {
	          continue;
	        }
	        group.name = newName;
	        this.emit('renameGroup', oldName, newName);
	      }
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.removeGroup = function(groupName) {
	      var group, i, len, ref;
	      this.checkTransactionStart();
	      ref = this.groups;
	      for (i = 0, len = ref.length; i < len; i++) {
	        group = ref[i];
	        if (!group) {
	          continue;
	        }
	        if (group.name !== groupName) {
	          continue;
	        }
	        this.setGroupMetadata(group.name, {});
	        this.groups.splice(this.groups.indexOf(group), 1);
	        this.emit('removeGroup', group);
	      }
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.setGroupMetadata = function(groupName, metadata) {
	      var before, group, i, item, len, ref, val;
	      this.checkTransactionStart();
	      ref = this.groups;
	      for (i = 0, len = ref.length; i < len; i++) {
	        group = ref[i];
	        if (!group) {
	          continue;
	        }
	        if (group.name !== groupName) {
	          continue;
	        }
	        before = clone(group.metadata);
	        for (item in metadata) {
	          val = metadata[item];
	          if (val != null) {
	            group.metadata[item] = val;
	          } else {
	            delete group.metadata[item];
	          }
	        }
	        this.emit('changeGroup', group, before, metadata);
	      }
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addNode = function(id, component, metadata) {
	      var node;
	      this.checkTransactionStart();
	      if (!metadata) {
	        metadata = {};
	      }
	      node = {
	        id: id,
	        component: component,
	        metadata: metadata
	      };
	      this.nodes.push(node);
	      this.emit('addNode', node);
	      this.checkTransactionEnd();
	      return node;
	    };

	    Graph.prototype.removeNode = function(id) {
	      var edge, exported, group, i, index, initializer, j, k, l, len, len1, len2, len3, len4, len5, len6, len7, len8, m, n, node, o, p, priv, pub, q, ref, ref1, ref2, ref3, ref4, ref5, toRemove;
	      node = this.getNode(id);
	      if (!node) {
	        return;
	      }
	      this.checkTransactionStart();
	      toRemove = [];
	      ref = this.edges;
	      for (i = 0, len = ref.length; i < len; i++) {
	        edge = ref[i];
	        if ((edge.from.node === node.id) || (edge.to.node === node.id)) {
	          toRemove.push(edge);
	        }
	      }
	      for (j = 0, len1 = toRemove.length; j < len1; j++) {
	        edge = toRemove[j];
	        this.removeEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port);
	      }
	      toRemove = [];
	      ref1 = this.initializers;
	      for (k = 0, len2 = ref1.length; k < len2; k++) {
	        initializer = ref1[k];
	        if (initializer.to.node === node.id) {
	          toRemove.push(initializer);
	        }
	      }
	      for (l = 0, len3 = toRemove.length; l < len3; l++) {
	        initializer = toRemove[l];
	        this.removeInitial(initializer.to.node, initializer.to.port);
	      }
	      toRemove = [];
	      ref2 = this.exports;
	      for (m = 0, len4 = ref2.length; m < len4; m++) {
	        exported = ref2[m];
	        if (this.getPortName(id) === exported.process) {
	          toRemove.push(exported);
	        }
	      }
	      for (n = 0, len5 = toRemove.length; n < len5; n++) {
	        exported = toRemove[n];
	        this.removeExport(exported["public"]);
	      }
	      toRemove = [];
	      ref3 = this.inports;
	      for (pub in ref3) {
	        priv = ref3[pub];
	        if (priv.process === id) {
	          toRemove.push(pub);
	        }
	      }
	      for (o = 0, len6 = toRemove.length; o < len6; o++) {
	        pub = toRemove[o];
	        this.removeInport(pub);
	      }
	      toRemove = [];
	      ref4 = this.outports;
	      for (pub in ref4) {
	        priv = ref4[pub];
	        if (priv.process === id) {
	          toRemove.push(pub);
	        }
	      }
	      for (p = 0, len7 = toRemove.length; p < len7; p++) {
	        pub = toRemove[p];
	        this.removeOutport(pub);
	      }
	      ref5 = this.groups;
	      for (q = 0, len8 = ref5.length; q < len8; q++) {
	        group = ref5[q];
	        if (!group) {
	          continue;
	        }
	        index = group.nodes.indexOf(id);
	        if (index === -1) {
	          continue;
	        }
	        group.nodes.splice(index, 1);
	      }
	      this.setNodeMetadata(id, {});
	      if (-1 !== this.nodes.indexOf(node)) {
	        this.nodes.splice(this.nodes.indexOf(node), 1);
	      }
	      this.emit('removeNode', node);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.getNode = function(id) {
	      var i, len, node, ref;
	      ref = this.nodes;
	      for (i = 0, len = ref.length; i < len; i++) {
	        node = ref[i];
	        if (!node) {
	          continue;
	        }
	        if (node.id === id) {
	          return node;
	        }
	      }
	      return null;
	    };

	    Graph.prototype.renameNode = function(oldId, newId) {
	      var edge, exported, group, i, iip, index, j, k, l, len, len1, len2, len3, node, priv, pub, ref, ref1, ref2, ref3, ref4, ref5;
	      this.checkTransactionStart();
	      node = this.getNode(oldId);
	      if (!node) {
	        return;
	      }
	      node.id = newId;
	      ref = this.edges;
	      for (i = 0, len = ref.length; i < len; i++) {
	        edge = ref[i];
	        if (!edge) {
	          continue;
	        }
	        if (edge.from.node === oldId) {
	          edge.from.node = newId;
	        }
	        if (edge.to.node === oldId) {
	          edge.to.node = newId;
	        }
	      }
	      ref1 = this.initializers;
	      for (j = 0, len1 = ref1.length; j < len1; j++) {
	        iip = ref1[j];
	        if (!iip) {
	          continue;
	        }
	        if (iip.to.node === oldId) {
	          iip.to.node = newId;
	        }
	      }
	      ref2 = this.inports;
	      for (pub in ref2) {
	        priv = ref2[pub];
	        if (priv.process === oldId) {
	          priv.process = newId;
	        }
	      }
	      ref3 = this.outports;
	      for (pub in ref3) {
	        priv = ref3[pub];
	        if (priv.process === oldId) {
	          priv.process = newId;
	        }
	      }
	      ref4 = this.exports;
	      for (k = 0, len2 = ref4.length; k < len2; k++) {
	        exported = ref4[k];
	        if (exported.process === oldId) {
	          exported.process = newId;
	        }
	      }
	      ref5 = this.groups;
	      for (l = 0, len3 = ref5.length; l < len3; l++) {
	        group = ref5[l];
	        if (!group) {
	          continue;
	        }
	        index = group.nodes.indexOf(oldId);
	        if (index === -1) {
	          continue;
	        }
	        group.nodes[index] = newId;
	      }
	      this.emit('renameNode', oldId, newId);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.setNodeMetadata = function(id, metadata) {
	      var before, item, node, val;
	      node = this.getNode(id);
	      if (!node) {
	        return;
	      }
	      this.checkTransactionStart();
	      before = clone(node.metadata);
	      if (!node.metadata) {
	        node.metadata = {};
	      }
	      for (item in metadata) {
	        val = metadata[item];
	        if (val != null) {
	          node.metadata[item] = val;
	        } else {
	          delete node.metadata[item];
	        }
	      }
	      this.emit('changeNode', node, before, metadata);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addEdge = function(outNode, outPort, inNode, inPort, metadata) {
	      var edge, i, len, ref;
	      if (metadata == null) {
	        metadata = {};
	      }
	      outPort = this.getPortName(outPort);
	      inPort = this.getPortName(inPort);
	      ref = this.edges;
	      for (i = 0, len = ref.length; i < len; i++) {
	        edge = ref[i];
	        if (edge.from.node === outNode && edge.from.port === outPort && edge.to.node === inNode && edge.to.port === inPort) {
	          return;
	        }
	      }
	      if (!this.getNode(outNode)) {
	        return;
	      }
	      if (!this.getNode(inNode)) {
	        return;
	      }
	      this.checkTransactionStart();
	      edge = {
	        from: {
	          node: outNode,
	          port: outPort
	        },
	        to: {
	          node: inNode,
	          port: inPort
	        },
	        metadata: metadata
	      };
	      this.edges.push(edge);
	      this.emit('addEdge', edge);
	      this.checkTransactionEnd();
	      return edge;
	    };

	    Graph.prototype.addEdgeIndex = function(outNode, outPort, outIndex, inNode, inPort, inIndex, metadata) {
	      var edge;
	      if (metadata == null) {
	        metadata = {};
	      }
	      if (!this.getNode(outNode)) {
	        return;
	      }
	      if (!this.getNode(inNode)) {
	        return;
	      }
	      outPort = this.getPortName(outPort);
	      inPort = this.getPortName(inPort);
	      if (inIndex === null) {
	        inIndex = void 0;
	      }
	      if (outIndex === null) {
	        outIndex = void 0;
	      }
	      if (!metadata) {
	        metadata = {};
	      }
	      this.checkTransactionStart();
	      edge = {
	        from: {
	          node: outNode,
	          port: outPort,
	          index: outIndex
	        },
	        to: {
	          node: inNode,
	          port: inPort,
	          index: inIndex
	        },
	        metadata: metadata
	      };
	      this.edges.push(edge);
	      this.emit('addEdge', edge);
	      this.checkTransactionEnd();
	      return edge;
	    };

	    Graph.prototype.removeEdge = function(node, port, node2, port2) {
	      var edge, i, index, j, k, len, len1, len2, ref, ref1, toKeep, toRemove;
	      this.checkTransactionStart();
	      port = this.getPortName(port);
	      port2 = this.getPortName(port2);
	      toRemove = [];
	      toKeep = [];
	      if (node2 && port2) {
	        ref = this.edges;
	        for (index = i = 0, len = ref.length; i < len; index = ++i) {
	          edge = ref[index];
	          if (edge.from.node === node && edge.from.port === port && edge.to.node === node2 && edge.to.port === port2) {
	            this.setEdgeMetadata(edge.from.node, edge.from.port, edge.to.node, edge.to.port, {});
	            toRemove.push(edge);
	          } else {
	            toKeep.push(edge);
	          }
	        }
	      } else {
	        ref1 = this.edges;
	        for (index = j = 0, len1 = ref1.length; j < len1; index = ++j) {
	          edge = ref1[index];
	          if ((edge.from.node === node && edge.from.port === port) || (edge.to.node === node && edge.to.port === port)) {
	            this.setEdgeMetadata(edge.from.node, edge.from.port, edge.to.node, edge.to.port, {});
	            toRemove.push(edge);
	          } else {
	            toKeep.push(edge);
	          }
	        }
	      }
	      this.edges = toKeep;
	      for (k = 0, len2 = toRemove.length; k < len2; k++) {
	        edge = toRemove[k];
	        this.emit('removeEdge', edge);
	      }
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.getEdge = function(node, port, node2, port2) {
	      var edge, i, index, len, ref;
	      port = this.getPortName(port);
	      port2 = this.getPortName(port2);
	      ref = this.edges;
	      for (index = i = 0, len = ref.length; i < len; index = ++i) {
	        edge = ref[index];
	        if (!edge) {
	          continue;
	        }
	        if (edge.from.node === node && edge.from.port === port) {
	          if (edge.to.node === node2 && edge.to.port === port2) {
	            return edge;
	          }
	        }
	      }
	      return null;
	    };

	    Graph.prototype.setEdgeMetadata = function(node, port, node2, port2, metadata) {
	      var before, edge, item, val;
	      edge = this.getEdge(node, port, node2, port2);
	      if (!edge) {
	        return;
	      }
	      this.checkTransactionStart();
	      before = clone(edge.metadata);
	      if (!edge.metadata) {
	        edge.metadata = {};
	      }
	      for (item in metadata) {
	        val = metadata[item];
	        if (val != null) {
	          edge.metadata[item] = val;
	        } else {
	          delete edge.metadata[item];
	        }
	      }
	      this.emit('changeEdge', edge, before, metadata);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addInitial = function(data, node, port, metadata) {
	      var initializer;
	      if (!this.getNode(node)) {
	        return;
	      }
	      port = this.getPortName(port);
	      this.checkTransactionStart();
	      initializer = {
	        from: {
	          data: data
	        },
	        to: {
	          node: node,
	          port: port
	        },
	        metadata: metadata
	      };
	      this.initializers.push(initializer);
	      this.emit('addInitial', initializer);
	      this.checkTransactionEnd();
	      return initializer;
	    };

	    Graph.prototype.addInitialIndex = function(data, node, port, index, metadata) {
	      var initializer;
	      if (!this.getNode(node)) {
	        return;
	      }
	      if (index === null) {
	        index = void 0;
	      }
	      port = this.getPortName(port);
	      this.checkTransactionStart();
	      initializer = {
	        from: {
	          data: data
	        },
	        to: {
	          node: node,
	          port: port,
	          index: index
	        },
	        metadata: metadata
	      };
	      this.initializers.push(initializer);
	      this.emit('addInitial', initializer);
	      this.checkTransactionEnd();
	      return initializer;
	    };

	    Graph.prototype.addGraphInitial = function(data, node, metadata) {
	      var inport;
	      inport = this.inports[node];
	      if (!inport) {
	        return;
	      }
	      return this.addInitial(data, inport.process, inport.port, metadata);
	    };

	    Graph.prototype.addGraphInitialIndex = function(data, node, index, metadata) {
	      var inport;
	      inport = this.inports[node];
	      if (!inport) {
	        return;
	      }
	      return this.addInitialIndex(data, inport.process, inport.port, index, metadata);
	    };

	    Graph.prototype.removeInitial = function(node, port) {
	      var edge, i, index, j, len, len1, ref, toKeep, toRemove;
	      port = this.getPortName(port);
	      this.checkTransactionStart();
	      toRemove = [];
	      toKeep = [];
	      ref = this.initializers;
	      for (index = i = 0, len = ref.length; i < len; index = ++i) {
	        edge = ref[index];
	        if (edge.to.node === node && edge.to.port === port) {
	          toRemove.push(edge);
	        } else {
	          toKeep.push(edge);
	        }
	      }
	      this.initializers = toKeep;
	      for (j = 0, len1 = toRemove.length; j < len1; j++) {
	        edge = toRemove[j];
	        this.emit('removeInitial', edge);
	      }
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.removeGraphInitial = function(node) {
	      var inport;
	      inport = this.inports[node];
	      if (!inport) {
	        return;
	      }
	      return this.removeInitial(inport.process, inport.port);
	    };

	    Graph.prototype.toDOT = function() {
	      var cleanID, cleanPort, data, dot, edge, i, id, initializer, j, k, len, len1, len2, node, ref, ref1, ref2;
	      cleanID = function(id) {
	        return id.replace(/\s*/g, "");
	      };
	      cleanPort = function(port) {
	        return port.replace(/\./g, "");
	      };
	      dot = "digraph {\n";
	      ref = this.nodes;
	      for (i = 0, len = ref.length; i < len; i++) {
	        node = ref[i];
	        dot += "    " + (cleanID(node.id)) + " [label=" + node.id + " shape=box]\n";
	      }
	      ref1 = this.initializers;
	      for (id = j = 0, len1 = ref1.length; j < len1; id = ++j) {
	        initializer = ref1[id];
	        if (typeof initializer.from.data === 'function') {
	          data = 'Function';
	        } else {
	          data = initializer.from.data;
	        }
	        dot += "    data" + id + " [label=\"'" + data + "'\" shape=plaintext]\n";
	        dot += "    data" + id + " -> " + (cleanID(initializer.to.node)) + "[headlabel=" + (cleanPort(initializer.to.port)) + " labelfontcolor=blue labelfontsize=8.0]\n";
	      }
	      ref2 = this.edges;
	      for (k = 0, len2 = ref2.length; k < len2; k++) {
	        edge = ref2[k];
	        dot += "    " + (cleanID(edge.from.node)) + " -> " + (cleanID(edge.to.node)) + "[taillabel=" + (cleanPort(edge.from.port)) + " headlabel=" + (cleanPort(edge.to.port)) + " labelfontcolor=blue labelfontsize=8.0]\n";
	      }
	      dot += "}";
	      return dot;
	    };

	    Graph.prototype.toYUML = function() {
	      var edge, i, initializer, j, len, len1, ref, ref1, yuml;
	      yuml = [];
	      ref = this.initializers;
	      for (i = 0, len = ref.length; i < len; i++) {
	        initializer = ref[i];
	        yuml.push("(start)[" + initializer.to.port + "]->(" + initializer.to.node + ")");
	      }
	      ref1 = this.edges;
	      for (j = 0, len1 = ref1.length; j < len1; j++) {
	        edge = ref1[j];
	        yuml.push("(" + edge.from.node + ")[" + edge.from.port + "]->(" + edge.to.node + ")");
	      }
	      return yuml.join(",");
	    };

	    Graph.prototype.toJSON = function() {
	      var connection, edge, exported, group, groupData, i, initializer, j, json, k, l, len, len1, len2, len3, len4, m, node, priv, property, pub, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, value;
	      json = {
	        caseSensitive: this.caseSensitive,
	        properties: {},
	        inports: {},
	        outports: {},
	        groups: [],
	        processes: {},
	        connections: []
	      };
	      if (this.name) {
	        json.properties.name = this.name;
	      }
	      ref = this.properties;
	      for (property in ref) {
	        value = ref[property];
	        json.properties[property] = value;
	      }
	      ref1 = this.inports;
	      for (pub in ref1) {
	        priv = ref1[pub];
	        json.inports[pub] = priv;
	      }
	      ref2 = this.outports;
	      for (pub in ref2) {
	        priv = ref2[pub];
	        json.outports[pub] = priv;
	      }
	      ref3 = this.exports;
	      for (i = 0, len = ref3.length; i < len; i++) {
	        exported = ref3[i];
	        if (!json.exports) {
	          json.exports = [];
	        }
	        json.exports.push(exported);
	      }
	      ref4 = this.groups;
	      for (j = 0, len1 = ref4.length; j < len1; j++) {
	        group = ref4[j];
	        groupData = {
	          name: group.name,
	          nodes: group.nodes
	        };
	        if (Object.keys(group.metadata).length) {
	          groupData.metadata = group.metadata;
	        }
	        json.groups.push(groupData);
	      }
	      ref5 = this.nodes;
	      for (k = 0, len2 = ref5.length; k < len2; k++) {
	        node = ref5[k];
	        json.processes[node.id] = {
	          component: node.component
	        };
	        if (node.metadata) {
	          json.processes[node.id].metadata = node.metadata;
	        }
	      }
	      ref6 = this.edges;
	      for (l = 0, len3 = ref6.length; l < len3; l++) {
	        edge = ref6[l];
	        connection = {
	          src: {
	            process: edge.from.node,
	            port: edge.from.port,
	            index: edge.from.index
	          },
	          tgt: {
	            process: edge.to.node,
	            port: edge.to.port,
	            index: edge.to.index
	          }
	        };
	        if (Object.keys(edge.metadata).length) {
	          connection.metadata = edge.metadata;
	        }
	        json.connections.push(connection);
	      }
	      ref7 = this.initializers;
	      for (m = 0, len4 = ref7.length; m < len4; m++) {
	        initializer = ref7[m];
	        json.connections.push({
	          data: initializer.from.data,
	          tgt: {
	            process: initializer.to.node,
	            port: initializer.to.port,
	            index: initializer.to.index
	          }
	        });
	      }
	      return json;
	    };

	    Graph.prototype.save = function(file, callback) {
	      var json;
	      if (platform.isBrowser()) {
	        return callback(new Error("Saving graphs not supported on browser"));
	      }
	      json = JSON.stringify(this.toJSON(), null, 4);
	      return __webpack_require__(11).writeFile(file + ".json", json, "utf-8", function(err, data) {
	        if (err) {
	          throw err;
	        }
	        return callback(file);
	      });
	    };

	    return Graph;

	  })(EventEmitter);

	  exports.Graph = Graph;

	  exports.createGraph = function(name, options) {
	    return new Graph(name, options);
	  };

	  exports.loadJSON = function(definition, callback, metadata) {
	    var caseSensitive, conn, def, exported, graph, group, i, id, j, k, len, len1, len2, portId, priv, processId, properties, property, pub, ref, ref1, ref2, ref3, ref4, ref5, ref6, split, value;
	    if (metadata == null) {
	      metadata = {};
	    }
	    if (typeof definition === 'string') {
	      definition = JSON.parse(definition);
	    }
	    if (!definition.properties) {
	      definition.properties = {};
	    }
	    if (!definition.processes) {
	      definition.processes = {};
	    }
	    if (!definition.connections) {
	      definition.connections = [];
	    }
	    caseSensitive = definition.caseSensitive || false;
	    graph = new Graph(definition.properties.name, {
	      caseSensitive: caseSensitive
	    });
	    graph.startTransaction('loadJSON', metadata);
	    properties = {};
	    ref = definition.properties;
	    for (property in ref) {
	      value = ref[property];
	      if (property === 'name') {
	        continue;
	      }
	      properties[property] = value;
	    }
	    graph.setProperties(properties);
	    ref1 = definition.processes;
	    for (id in ref1) {
	      def = ref1[id];
	      if (!def.metadata) {
	        def.metadata = {};
	      }
	      graph.addNode(id, def.component, def.metadata);
	    }
	    ref2 = definition.connections;
	    for (i = 0, len = ref2.length; i < len; i++) {
	      conn = ref2[i];
	      metadata = conn.metadata ? conn.metadata : {};
	      if (conn.data !== void 0) {
	        if (typeof conn.tgt.index === 'number') {
	          graph.addInitialIndex(conn.data, conn.tgt.process, graph.getPortName(conn.tgt.port), conn.tgt.index, metadata);
	        } else {
	          graph.addInitial(conn.data, conn.tgt.process, graph.getPortName(conn.tgt.port), metadata);
	        }
	        continue;
	      }
	      if (typeof conn.src.index === 'number' || typeof conn.tgt.index === 'number') {
	        graph.addEdgeIndex(conn.src.process, graph.getPortName(conn.src.port), conn.src.index, conn.tgt.process, graph.getPortName(conn.tgt.port), conn.tgt.index, metadata);
	        continue;
	      }
	      graph.addEdge(conn.src.process, graph.getPortName(conn.src.port), conn.tgt.process, graph.getPortName(conn.tgt.port), metadata);
	    }
	    if (definition.exports && definition.exports.length) {
	      ref3 = definition.exports;
	      for (j = 0, len1 = ref3.length; j < len1; j++) {
	        exported = ref3[j];
	        if (exported["private"]) {
	          split = exported["private"].split('.');
	          if (split.length !== 2) {
	            continue;
	          }
	          processId = split[0];
	          portId = split[1];
	          for (id in definition.processes) {
	            if (graph.getPortName(id) === graph.getPortName(processId)) {
	              processId = id;
	            }
	          }
	        } else {
	          processId = exported.process;
	          portId = graph.getPortName(exported.port);
	        }
	        graph.addExport(exported["public"], processId, portId, exported.metadata);
	      }
	    }
	    if (definition.inports) {
	      ref4 = definition.inports;
	      for (pub in ref4) {
	        priv = ref4[pub];
	        graph.addInport(pub, priv.process, graph.getPortName(priv.port), priv.metadata);
	      }
	    }
	    if (definition.outports) {
	      ref5 = definition.outports;
	      for (pub in ref5) {
	        priv = ref5[pub];
	        graph.addOutport(pub, priv.process, graph.getPortName(priv.port), priv.metadata);
	      }
	    }
	    if (definition.groups) {
	      ref6 = definition.groups;
	      for (k = 0, len2 = ref6.length; k < len2; k++) {
	        group = ref6[k];
	        graph.addGroup(group.name, group.nodes, group.metadata || {});
	      }
	    }
	    graph.endTransaction('loadJSON');
	    return callback(null, graph);
	  };

	  exports.loadFBP = function(fbpData, callback, metadata, caseSensitive) {
	    var definition, e, error;
	    if (metadata == null) {
	      metadata = {};
	    }
	    if (caseSensitive == null) {
	      caseSensitive = false;
	    }
	    try {
	      definition = __webpack_require__(12).parse(fbpData, {
	        caseSensitive: caseSensitive
	      });
	    } catch (error) {
	      e = error;
	      return callback(e);
	    }
	    return exports.loadJSON(definition, callback, metadata);
	  };

	  exports.loadHTTP = function(url, callback) {
	    var req;
	    req = new XMLHttpRequest;
	    req.onreadystatechange = function() {
	      if (req.readyState !== 4) {
	        return;
	      }
	      if (req.status !== 200) {
	        return callback(new Error("Failed to load " + url + ": HTTP " + req.status));
	      }
	      return callback(null, req.responseText);
	    };
	    req.open('GET', url, true);
	    return req.send();
	  };

	  exports.loadFile = function(file, callback, metadata, caseSensitive) {
	    if (metadata == null) {
	      metadata = {};
	    }
	    if (caseSensitive == null) {
	      caseSensitive = false;
	    }
	    if (platform.isBrowser()) {
	      exports.loadHTTP(file, function(err, data) {
	        var definition;
	        if (err) {
	          return callback(err);
	        }
	        if (file.split('.').pop() === 'fbp') {
	          return exports.loadFBP(data, callback, metadata);
	        }
	        definition = JSON.parse(data);
	        return exports.loadJSON(definition, callback, metadata);
	      });
	      return;
	    }
	    return __webpack_require__(11).readFile(file, "utf-8", function(err, data) {
	      var definition;
	      if (err) {
	        return callback(err);
	      }
	      if (file.split('.').pop() === 'fbp') {
	        return exports.loadFBP(data, callback, {}, caseSensitive);
	      }
	      definition = JSON.parse(data);
	      return exports.loadJSON(definition, callback, {});
	    });
	  };

	  resetGraph = function(graph) {
	    var edge, exp, group, i, iip, j, k, l, len, len1, len2, len3, len4, m, node, port, ref, ref1, ref2, ref3, ref4, ref5, ref6, results, v;
	    ref = (clone(graph.groups)).reverse();
	    for (i = 0, len = ref.length; i < len; i++) {
	      group = ref[i];
	      if (group != null) {
	        graph.removeGroup(group.name);
	      }
	    }
	    ref1 = clone(graph.outports);
	    for (port in ref1) {
	      v = ref1[port];
	      graph.removeOutport(port);
	    }
	    ref2 = clone(graph.inports);
	    for (port in ref2) {
	      v = ref2[port];
	      graph.removeInport(port);
	    }
	    ref3 = clone(graph.exports.reverse());
	    for (j = 0, len1 = ref3.length; j < len1; j++) {
	      exp = ref3[j];
	      graph.removeExport(exp["public"]);
	    }
	    graph.setProperties({});
	    ref4 = (clone(graph.initializers)).reverse();
	    for (k = 0, len2 = ref4.length; k < len2; k++) {
	      iip = ref4[k];
	      graph.removeInitial(iip.to.node, iip.to.port);
	    }
	    ref5 = (clone(graph.edges)).reverse();
	    for (l = 0, len3 = ref5.length; l < len3; l++) {
	      edge = ref5[l];
	      graph.removeEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port);
	    }
	    ref6 = (clone(graph.nodes)).reverse();
	    results = [];
	    for (m = 0, len4 = ref6.length; m < len4; m++) {
	      node = ref6[m];
	      results.push(graph.removeNode(node.id));
	    }
	    return results;
	  };

	  mergeResolveTheirsNaive = function(base, to) {
	    var edge, exp, group, i, iip, j, k, l, len, len1, len2, len3, len4, m, node, priv, pub, ref, ref1, ref2, ref3, ref4, ref5, ref6, results;
	    resetGraph(base);
	    ref = to.nodes;
	    for (i = 0, len = ref.length; i < len; i++) {
	      node = ref[i];
	      base.addNode(node.id, node.component, node.metadata);
	    }
	    ref1 = to.edges;
	    for (j = 0, len1 = ref1.length; j < len1; j++) {
	      edge = ref1[j];
	      base.addEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port, edge.metadata);
	    }
	    ref2 = to.initializers;
	    for (k = 0, len2 = ref2.length; k < len2; k++) {
	      iip = ref2[k];
	      base.addInitial(iip.from.data, iip.to.node, iip.to.port, iip.metadata);
	    }
	    ref3 = to.exports;
	    for (l = 0, len3 = ref3.length; l < len3; l++) {
	      exp = ref3[l];
	      base.addExport(exp["public"], exp.node, exp.port, exp.metadata);
	    }
	    base.setProperties(to.properties);
	    ref4 = to.inports;
	    for (pub in ref4) {
	      priv = ref4[pub];
	      base.addInport(pub, priv.process, priv.port, priv.metadata);
	    }
	    ref5 = to.outports;
	    for (pub in ref5) {
	      priv = ref5[pub];
	      base.addOutport(pub, priv.process, priv.port, priv.metadata);
	    }
	    ref6 = to.groups;
	    results = [];
	    for (m = 0, len4 = ref6.length; m < len4; m++) {
	      group = ref6[m];
	      results.push(base.addGroup(group.name, group.nodes, group.metadata));
	    }
	    return results;
	  };

	  exports.equivalent = function(a, b, options) {
	    var A, B;
	    if (options == null) {
	      options = {};
	    }
	    A = JSON.stringify(a);
	    B = JSON.stringify(b);
	    return A === B;
	  };

	  exports.mergeResolveTheirs = mergeResolveTheirsNaive;

	}).call(this);


/***/ },
/* 3 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var clone = (function() {
	'use strict';

	var nativeMap;
	try {
	  nativeMap = Map;
	} catch(_) {
	  // maybe a reference error because no `Map`. Give it a dummy value that no
	  // value will ever be an instanceof.
	  nativeMap = function() {};
	}

	var nativeSet;
	try {
	  nativeSet = Set;
	} catch(_) {
	  nativeSet = function() {};
	}

	var nativePromise;
	try {
	  nativePromise = Promise;
	} catch(_) {
	  nativePromise = function() {};
	}

	/**
	 * Clones (copies) an Object using deep copying.
	 *
	 * This function supports circular references by default, but if you are certain
	 * there are no circular references in your object, you can save some CPU time
	 * by calling clone(obj, false).
	 *
	 * Caution: if `circular` is false and `parent` contains circular references,
	 * your program may enter an infinite loop and crash.
	 *
	 * @param `parent` - the object to be cloned
	 * @param `circular` - set to true if the object to be cloned may contain
	 *    circular references. (optional - true by default)
	 * @param `depth` - set to a number if the object is only to be cloned to
	 *    a particular depth. (optional - defaults to Infinity)
	 * @param `prototype` - sets the prototype to be used when cloning an object.
	 *    (optional - defaults to parent prototype).
	 * @param `includeNonEnumerable` - set to true if the non-enumerable properties
	 *    should be cloned as well. Non-enumerable properties on the prototype
	 *    chain will be ignored. (optional - false by default)
	*/
	function clone(parent, circular, depth, prototype, includeNonEnumerable) {
	  if (typeof circular === 'object') {
	    depth = circular.depth;
	    prototype = circular.prototype;
	    includeNonEnumerable = circular.includeNonEnumerable;
	    circular = circular.circular;
	  }
	  // maintain two arrays for circular references, where corresponding parents
	  // and children have the same index
	  var allParents = [];
	  var allChildren = [];

	  var useBuffer = typeof Buffer != 'undefined';

	  if (typeof circular == 'undefined')
	    circular = true;

	  if (typeof depth == 'undefined')
	    depth = Infinity;

	  // recurse this function so we don't reset allParents and allChildren
	  function _clone(parent, depth) {
	    // cloning null always returns null
	    if (parent === null)
	      return null;

	    if (depth === 0)
	      return parent;

	    var child;
	    var proto;
	    if (typeof parent != 'object') {
	      return parent;
	    }

	    if (parent instanceof nativeMap) {
	      child = new nativeMap();
	    } else if (parent instanceof nativeSet) {
	      child = new nativeSet();
	    } else if (parent instanceof nativePromise) {
	      child = new nativePromise(function (resolve, reject) {
	        parent.then(function(value) {
	          resolve(_clone(value, depth - 1));
	        }, function(err) {
	          reject(_clone(err, depth - 1));
	        });
	      });
	    } else if (clone.__isArray(parent)) {
	      child = [];
	    } else if (clone.__isRegExp(parent)) {
	      child = new RegExp(parent.source, __getRegExpFlags(parent));
	      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
	    } else if (clone.__isDate(parent)) {
	      child = new Date(parent.getTime());
	    } else if (useBuffer && Buffer.isBuffer(parent)) {
	      child = new Buffer(parent.length);
	      parent.copy(child);
	      return child;
	    } else if (parent instanceof Error) {
	      child = Object.create(parent);
	    } else {
	      if (typeof prototype == 'undefined') {
	        proto = Object.getPrototypeOf(parent);
	        child = Object.create(proto);
	      }
	      else {
	        child = Object.create(prototype);
	        proto = prototype;
	      }
	    }

	    if (circular) {
	      var index = allParents.indexOf(parent);

	      if (index != -1) {
	        return allChildren[index];
	      }
	      allParents.push(parent);
	      allChildren.push(child);
	    }

	    if (parent instanceof nativeMap) {
	      var keyIterator = parent.keys();
	      while(true) {
	        var next = keyIterator.next();
	        if (next.done) {
	          break;
	        }
	        var keyChild = _clone(next.value, depth - 1);
	        var valueChild = _clone(parent.get(next.value), depth - 1);
	        child.set(keyChild, valueChild);
	      }
	    }
	    if (parent instanceof nativeSet) {
	      var iterator = parent.keys();
	      while(true) {
	        var next = iterator.next();
	        if (next.done) {
	          break;
	        }
	        var entryChild = _clone(next.value, depth - 1);
	        child.add(entryChild);
	      }
	    }

	    for (var i in parent) {
	      var attrs;
	      if (proto) {
	        attrs = Object.getOwnPropertyDescriptor(proto, i);
	      }

	      if (attrs && attrs.set == null) {
	        continue;
	      }
	      child[i] = _clone(parent[i], depth - 1);
	    }

	    if (Object.getOwnPropertySymbols) {
	      var symbols = Object.getOwnPropertySymbols(parent);
	      for (var i = 0; i < symbols.length; i++) {
	        // Don't need to worry about cloning a symbol because it is a primitive,
	        // like a number or string.
	        var symbol = symbols[i];
	        var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
	        if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
	          continue;
	        }
	        child[symbol] = _clone(parent[symbol], depth - 1);
	        if (!descriptor.enumerable) {
	          Object.defineProperty(child, symbol, {
	            enumerable: false
	          });
	        }
	      }
	    }

	    if (includeNonEnumerable) {
	      var allPropertyNames = Object.getOwnPropertyNames(parent);
	      for (var i = 0; i < allPropertyNames.length; i++) {
	        var propertyName = allPropertyNames[i];
	        var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
	        if (descriptor && descriptor.enumerable) {
	          continue;
	        }
	        child[propertyName] = _clone(parent[propertyName], depth - 1);
	        Object.defineProperty(child, propertyName, {
	          enumerable: false
	        });
	      }
	    }

	    return child;
	  }

	  return _clone(parent, depth);
	}

	/**
	 * Simple flat clone using prototype, accepts only objects, usefull for property
	 * override on FLAT configuration object (no nested props).
	 *
	 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
	 * works.
	 */
	clone.clonePrototype = function clonePrototype(parent) {
	  if (parent === null)
	    return null;

	  var c = function () {};
	  c.prototype = parent;
	  return new c();
	};

	// private utility functions

	function __objToStr(o) {
	  return Object.prototype.toString.call(o);
	}
	clone.__objToStr = __objToStr;

	function __isDate(o) {
	  return typeof o === 'object' && __objToStr(o) === '[object Date]';
	}
	clone.__isDate = __isDate;

	function __isArray(o) {
	  return typeof o === 'object' && __objToStr(o) === '[object Array]';
	}
	clone.__isArray = __isArray;

	function __isRegExp(o) {
	  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
	}
	clone.__isRegExp = __isRegExp;

	function __getRegExpFlags(re) {
	  var flags = '';
	  if (re.global) flags += 'g';
	  if (re.ignoreCase) flags += 'i';
	  if (re.multiline) flags += 'm';
	  return flags;
	}
	clone.__getRegExpFlags = __getRegExpFlags;

	return clone;
	})();

	if (typeof module === 'object' && module.exports) {
	  module.exports = clone;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5).Buffer))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(6)
	var ieee754 = __webpack_require__(7)
	var isArray = __webpack_require__(8)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	/*
	 * Export kMaxLength after typed array support is determined.
	 */
	exports.kMaxLength = kMaxLength()

	function typedArraySupport () {
	  try {
	    var arr = new Uint8Array(1)
	    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
	    return arr.foo() === 42 && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	function createBuffer (that, length) {
	  if (kMaxLength() < length) {
	    throw new RangeError('Invalid typed array length')
	  }
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length)
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    if (that === null) {
	      that = new Buffer(length)
	    }
	    that.length = length
	  }

	  return that
	}

	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */

	function Buffer (arg, encodingOrOffset, length) {
	  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
	    return new Buffer(arg, encodingOrOffset, length)
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new Error(
	        'If encoding is specified then the first argument must be a string'
	      )
	    }
	    return allocUnsafe(this, arg)
	  }
	  return from(this, arg, encodingOrOffset, length)
	}

	Buffer.poolSize = 8192 // not used by this implementation

	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer._augment = function (arr) {
	  arr.__proto__ = Buffer.prototype
	  return arr
	}

	function from (that, value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }

	  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	    return fromArrayBuffer(that, value, encodingOrOffset, length)
	  }

	  if (typeof value === 'string') {
	    return fromString(that, value, encodingOrOffset)
	  }

	  return fromObject(that, value)
	}

	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(null, value, encodingOrOffset, length)
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	  if (typeof Symbol !== 'undefined' && Symbol.species &&
	      Buffer[Symbol.species] === Buffer) {
	    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
	    Object.defineProperty(Buffer, Symbol.species, {
	      value: null,
	      configurable: true
	    })
	  }
	}

	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be a number')
	  } else if (size < 0) {
	    throw new RangeError('"size" argument must not be negative')
	  }
	}

	function alloc (that, size, fill, encoding) {
	  assertSize(size)
	  if (size <= 0) {
	    return createBuffer(that, size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpretted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(that, size).fill(fill, encoding)
	      : createBuffer(that, size).fill(fill)
	  }
	  return createBuffer(that, size)
	}

	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(null, size, fill, encoding)
	}

	function allocUnsafe (that, size) {
	  assertSize(size)
	  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < size; ++i) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(null, size)
	}
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(null, size)
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8'
	  }

	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }

	  var length = byteLength(string, encoding) | 0
	  that = createBuffer(that, length)

	  var actual = that.write(string, encoding)

	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    that = that.slice(0, actual)
	  }

	  return that
	}

	function fromArrayLike (that, array) {
	  var length = array.length < 0 ? 0 : checked(array.length) | 0
	  that = createBuffer(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array, byteOffset, length) {
	  array.byteLength // this throws if `array` is not a valid ArrayBuffer

	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('\'offset\' is out of bounds')
	  }

	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('\'length\' is out of bounds')
	  }

	  if (byteOffset === undefined && length === undefined) {
	    array = new Uint8Array(array)
	  } else if (length === undefined) {
	    array = new Uint8Array(array, byteOffset)
	  } else {
	    array = new Uint8Array(array, byteOffset, length)
	  }

	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = array
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromArrayLike(that, array)
	  }
	  return that
	}

	function fromObject (that, obj) {
	  if (Buffer.isBuffer(obj)) {
	    var len = checked(obj.length) | 0
	    that = createBuffer(that, len)

	    if (that.length === 0) {
	      return that
	    }

	    obj.copy(that, 0, 0, len)
	    return that
	  }

	  if (obj) {
	    if ((typeof ArrayBuffer !== 'undefined' &&
	        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	      if (typeof obj.length !== 'number' || isnan(obj.length)) {
	        return createBuffer(that, 0)
	      }
	      return fromArrayLike(that, obj)
	    }

	    if (obj.type === 'Buffer' && isArray(obj.data)) {
	      return fromArrayLike(that, obj.data)
	    }
	  }

	  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength()` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (length) {
	  if (+length != length) { // eslint-disable-line eqeqeq
	    length = 0
	  }
	  return Buffer.alloc(+length)
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i]
	      y = b[i]
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }

	  if (list.length === 0) {
	    return Buffer.alloc(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length
	    }
	  }

	  var buffer = Buffer.allocUnsafe(length)
	  var pos = 0
	  for (i = 0; i < list.length; ++i) {
	    var buf = list[i]
	    if (!Buffer.isBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    }
	    buf.copy(buffer, pos)
	    pos += buf.length
	  }
	  return buffer
	}

	function byteLength (string, encoding) {
	  if (Buffer.isBuffer(string)) {
	    return string.length
	  }
	  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    string = '' + string
	  }

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len
	      case 'utf8':
	      case 'utf-8':
	      case undefined:
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.

	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }

	  if (end === undefined || end > this.length) {
	    end = this.length
	  }

	  if (end <= 0) {
	    return ''
	  }

	  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0
	  start >>>= 0

	  if (end <= start) {
	    return ''
	  }

	  if (!encoding) encoding = 'utf8'

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer.prototype._isBuffer = true

	function swap (b, n, m) {
	  var i = b[n]
	  b[n] = b[m]
	  b[m] = i
	}

	Buffer.prototype.swap16 = function swap16 () {
	  var len = this.length
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (var i = 0; i < len; i += 2) {
	    swap(this, i, i + 1)
	  }
	  return this
	}

	Buffer.prototype.swap32 = function swap32 () {
	  var len = this.length
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (var i = 0; i < len; i += 4) {
	    swap(this, i, i + 3)
	    swap(this, i + 1, i + 2)
	  }
	  return this
	}

	Buffer.prototype.swap64 = function swap64 () {
	  var len = this.length
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits')
	  }
	  for (var i = 0; i < len; i += 8) {
	    swap(this, i, i + 7)
	    swap(this, i + 1, i + 6)
	    swap(this, i + 2, i + 5)
	    swap(this, i + 3, i + 4)
	  }
	  return this
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (!Buffer.isBuffer(target)) {
	    throw new TypeError('Argument must be a Buffer')
	  }

	  if (start === undefined) {
	    start = 0
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0
	  }
	  if (thisStart === undefined) {
	    thisStart = 0
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length
	  }

	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }

	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }

	  start >>>= 0
	  end >>>= 0
	  thisStart >>>= 0
	  thisEnd >>>= 0

	  if (this === target) return 0

	  var x = thisEnd - thisStart
	  var y = end - start
	  var len = Math.min(x, y)

	  var thisCopy = this.slice(thisStart, thisEnd)
	  var targetCopy = target.slice(start, end)

	  for (var i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i]
	      y = targetCopy[i]
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1

	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset
	    byteOffset = 0
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000
	  }
	  byteOffset = +byteOffset  // Coerce to Number.
	  if (isNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : (buffer.length - 1)
	  }

	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1
	    else byteOffset = buffer.length - 1
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0
	    else return -1
	  }

	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding)
	  }

	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (Buffer.isBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
	  } else if (typeof val === 'number') {
	    val = val & 0xFF // Search for a byte value [0-255]
	    if (Buffer.TYPED_ARRAY_SUPPORT &&
	        typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
	      }
	    }
	    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
	  var indexSize = 1
	  var arrLength = arr.length
	  var valLength = val.length

	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase()
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2
	      arrLength /= 2
	      valLength /= 2
	      byteOffset /= 2
	    }
	  }

	  function read (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }

	  var i
	  if (dir) {
	    var foundIndex = -1
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex
	        foundIndex = -1
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
	    for (i = byteOffset; i >= 0; i--) {
	      var found = true
	      for (var j = 0; j < valLength; j++) {
	        if (read(arr, i + j) !== read(val, j)) {
	          found = false
	          break
	        }
	      }
	      if (found) return i
	    }
	  }

	  return -1
	}

	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
	}

	Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; ++i) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) return i
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function latin1Write (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'latin1':
	      case 'binary':
	        return latin1Write(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function latin1Slice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; ++i) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end)
	    newBuf.__proto__ = Buffer.prototype
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; ++i) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; --i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; ++i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    )
	  }

	  return len
	}

	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start
	      start = 0
	      end = this.length
	    } else if (typeof end === 'string') {
	      encoding = end
	      end = this.length
	    }
	    if (val.length === 1) {
	      var code = val.charCodeAt(0)
	      if (code < 256) {
	        val = code
	      }
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255
	  }

	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }

	  if (end <= start) {
	    return this
	  }

	  start = start >>> 0
	  end = end === undefined ? this.length : end >>> 0

	  if (!val) val = 0

	  var i
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val
	    }
	  } else {
	    var bytes = Buffer.isBuffer(val)
	      ? val
	      : utf8ToBytes(new Buffer(val, encoding).toString())
	    var len = bytes.length
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len]
	    }
	  }

	  return this
	}

	// HELPER FUNCTIONS
	// ================

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; ++i) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	function isnan (val) {
	  return val !== val // eslint-disable-line no-self-compare
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict'

	exports.byteLength = byteLength
	exports.toByteArray = toByteArray
	exports.fromByteArray = fromByteArray

	var lookup = []
	var revLookup = []
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	for (var i = 0, len = code.length; i < len; ++i) {
	  lookup[i] = code[i]
	  revLookup[code.charCodeAt(i)] = i
	}

	revLookup['-'.charCodeAt(0)] = 62
	revLookup['_'.charCodeAt(0)] = 63

	function placeHoldersCount (b64) {
	  var len = b64.length
	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // the number of equal signs (place holders)
	  // if there are two placeholders, than the two characters before it
	  // represent one byte
	  // if there is only one, then the three characters before it represent 2 bytes
	  // this is just a cheap hack to not do indexOf twice
	  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
	}

	function byteLength (b64) {
	  // base64 is 4/3 + up to two characters of the original data
	  return b64.length * 3 / 4 - placeHoldersCount(b64)
	}

	function toByteArray (b64) {
	  var i, j, l, tmp, placeHolders, arr
	  var len = b64.length
	  placeHolders = placeHoldersCount(b64)

	  arr = new Arr(len * 3 / 4 - placeHolders)

	  // if there are placeholders, only get up to the last complete 4 chars
	  l = placeHolders > 0 ? len - 4 : len

	  var L = 0

	  for (i = 0, j = 0; i < l; i += 4, j += 3) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
	    arr[L++] = (tmp >> 16) & 0xFF
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }

	  if (placeHolders === 2) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
	    arr[L++] = tmp & 0xFF
	  } else if (placeHolders === 1) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp
	  var output = []
	  for (var i = start; i < end; i += 3) {
	    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
	    output.push(tripletToBase64(tmp))
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  var tmp
	  var len = uint8.length
	  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
	  var output = ''
	  var parts = []
	  var maxChunkLength = 16383 // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1]
	    output += lookup[tmp >> 2]
	    output += lookup[(tmp << 4) & 0x3F]
	    output += '=='
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
	    output += lookup[tmp >> 10]
	    output += lookup[(tmp >> 4) & 0x3F]
	    output += lookup[(tmp << 2) & 0x3F]
	    output += '='
	  }

	  parts.push(output)

	  return parts.join('')
	}


/***/ },
/* 7 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 8 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {(function() {
	  exports.isBrowser = function() {
	    if (typeof process !== 'undefined' && process.execPath && process.execPath.match(/node|iojs/)) {
	      return false;
	    }
	    return true;
	  };

	  exports.deprecated = function(message) {
	    if (exports.isBrowser()) {
	      if (window.NOFLO_FATAL_DEPRECATED) {
	        throw new Error(message);
	      }
	      console.warn(message);
	      return;
	    }
	    if (process.env.NOFLO_FATAL_DEPRECATED) {
	      throw new Error(message);
	    }
	    return console.warn(message);
	  };

	}).call(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10)))

/***/ },
/* 10 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 11 */
/***/ function(module, exports) {

	

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = (function() {
	  "use strict";

	  /*
	   * Generated by PEG.js 0.9.0.
	   *
	   * http://pegjs.org/
	   */

	  function peg$subclass(child, parent) {
	    function ctor() { this.constructor = child; }
	    ctor.prototype = parent.prototype;
	    child.prototype = new ctor();
	  }

	  function peg$SyntaxError(message, expected, found, location) {
	    this.message  = message;
	    this.expected = expected;
	    this.found    = found;
	    this.location = location;
	    this.name     = "SyntaxError";

	    if (typeof Error.captureStackTrace === "function") {
	      Error.captureStackTrace(this, peg$SyntaxError);
	    }
	  }

	  peg$subclass(peg$SyntaxError, Error);

	  function peg$parse(input) {
	    var options = arguments.length > 1 ? arguments[1] : {},
	        parser  = this,

	        peg$FAILED = {},

	        peg$startRuleFunctions = { start: peg$parsestart },
	        peg$startRuleFunction  = peg$parsestart,

	        peg$c0 = function() { return parser.getResult();  },
	        peg$c1 = "EXPORT=",
	        peg$c2 = { type: "literal", value: "EXPORT=", description: "\"EXPORT=\"" },
	        peg$c3 = ":",
	        peg$c4 = { type: "literal", value: ":", description: "\":\"" },
	        peg$c5 = function(priv, pub) {return parser.registerExports(priv,pub)},
	        peg$c6 = "INPORT=",
	        peg$c7 = { type: "literal", value: "INPORT=", description: "\"INPORT=\"" },
	        peg$c8 = ".",
	        peg$c9 = { type: "literal", value: ".", description: "\".\"" },
	        peg$c10 = function(node, port, pub) {return parser.registerInports(node,port,pub)},
	        peg$c11 = "OUTPORT=",
	        peg$c12 = { type: "literal", value: "OUTPORT=", description: "\"OUTPORT=\"" },
	        peg$c13 = function(node, port, pub) {return parser.registerOutports(node,port,pub)},
	        peg$c14 = "DEFAULT_INPORT=",
	        peg$c15 = { type: "literal", value: "DEFAULT_INPORT=", description: "\"DEFAULT_INPORT=\"" },
	        peg$c16 = function(name) { defaultInPort = name},
	        peg$c17 = "DEFAULT_OUTPORT=",
	        peg$c18 = { type: "literal", value: "DEFAULT_OUTPORT=", description: "\"DEFAULT_OUTPORT=\"" },
	        peg$c19 = function(name) { defaultOutPort = name},
	        peg$c20 = /^[\n\r\u2028\u2029]/,
	        peg$c21 = { type: "class", value: "[\\n\\r\\u2028\\u2029]", description: "[\\n\\r\\u2028\\u2029]" },
	        peg$c22 = function(edges) {return parser.registerEdges(edges);},
	        peg$c23 = ",",
	        peg$c24 = { type: "literal", value: ",", description: "\",\"" },
	        peg$c25 = "#",
	        peg$c26 = { type: "literal", value: "#", description: "\"#\"" },
	        peg$c27 = "->",
	        peg$c28 = { type: "literal", value: "->", description: "\"->\"" },
	        peg$c29 = function(x, y) { return [x,y]; },
	        peg$c30 = function(x, proc, y) { return [{"tgt":makeInPort(proc, x)},{"src":makeOutPort(proc, y)}]; },
	        peg$c31 = function(proc, port) { return {"src":makeOutPort(proc, port)} },
	        peg$c32 = function(port, proc) { return {"tgt":makeInPort(proc, port)} },
	        peg$c33 = "'",
	        peg$c34 = { type: "literal", value: "'", description: "\"'\"" },
	        peg$c35 = function(iip) { return {"data":iip.join("")} },
	        peg$c36 = function(iip) { return {"data":iip} },
	        peg$c37 = function(name) { return name},
	        peg$c38 = /^[a-zA-Z_]/,
	        peg$c39 = { type: "class", value: "[a-zA-Z_]", description: "[a-zA-Z_]" },
	        peg$c40 = /^[a-zA-Z0-9_\-]/,
	        peg$c41 = { type: "class", value: "[a-zA-Z0-9_\\-]", description: "[a-zA-Z0-9_\\-]" },
	        peg$c42 = function(name) { return makeName(name)},
	        peg$c43 = function(name, comp) { parser.addNode(name,comp); return name},
	        peg$c44 = function(comp) { return parser.addAnonymousNode(comp, location().start.offset) },
	        peg$c45 = "(",
	        peg$c46 = { type: "literal", value: "(", description: "\"(\"" },
	        peg$c47 = /^[a-zA-Z\/\-0-9_]/,
	        peg$c48 = { type: "class", value: "[a-zA-Z/\\-0-9_]", description: "[a-zA-Z/\\-0-9_]" },
	        peg$c49 = ")",
	        peg$c50 = { type: "literal", value: ")", description: "\")\"" },
	        peg$c51 = function(comp, meta) { var o = {}; comp ? o.comp = comp.join("") : o.comp = ''; meta ? o.meta = meta.join("").split(',') : null; return o; },
	        peg$c52 = /^[a-zA-Z\/=_,0-9]/,
	        peg$c53 = { type: "class", value: "[a-zA-Z/=_,0-9]", description: "[a-zA-Z/=_,0-9]" },
	        peg$c54 = function(meta) {return meta},
	        peg$c55 = function(portname, portindex) {return { port: options.caseSensitive? portname : portname.toLowerCase(), index: portindex != null ? portindex : undefined }},
	        peg$c56 = function(port) { return port; },
	        peg$c57 = /^[a-zA-Z.0-9_]/,
	        peg$c58 = { type: "class", value: "[a-zA-Z.0-9_]", description: "[a-zA-Z.0-9_]" },
	        peg$c59 = function(portname) {return makeName(portname)},
	        peg$c60 = "[",
	        peg$c61 = { type: "literal", value: "[", description: "\"[\"" },
	        peg$c62 = /^[0-9]/,
	        peg$c63 = { type: "class", value: "[0-9]", description: "[0-9]" },
	        peg$c64 = "]",
	        peg$c65 = { type: "literal", value: "]", description: "\"]\"" },
	        peg$c66 = function(portindex) {return parseInt(portindex.join(''))},
	        peg$c67 = /^[^\n\r\u2028\u2029]/,
	        peg$c68 = { type: "class", value: "[^\\n\\r\\u2028\\u2029]", description: "[^\\n\\r\\u2028\\u2029]" },
	        peg$c69 = /^[\\]/,
	        peg$c70 = { type: "class", value: "[\\\\]", description: "[\\\\]" },
	        peg$c71 = /^[']/,
	        peg$c72 = { type: "class", value: "[']", description: "[']" },
	        peg$c73 = function() { return "'"; },
	        peg$c74 = /^[^']/,
	        peg$c75 = { type: "class", value: "[^']", description: "[^']" },
	        peg$c76 = " ",
	        peg$c77 = { type: "literal", value: " ", description: "\" \"" },
	        peg$c78 = function(value) { return value; },
	        peg$c79 = "{",
	        peg$c80 = { type: "literal", value: "{", description: "\"{\"" },
	        peg$c81 = "}",
	        peg$c82 = { type: "literal", value: "}", description: "\"}\"" },
	        peg$c83 = { type: "other", description: "whitespace" },
	        peg$c84 = /^[ \t\n\r]/,
	        peg$c85 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
	        peg$c86 = "false",
	        peg$c87 = { type: "literal", value: "false", description: "\"false\"" },
	        peg$c88 = function() { return false; },
	        peg$c89 = "null",
	        peg$c90 = { type: "literal", value: "null", description: "\"null\"" },
	        peg$c91 = function() { return null;  },
	        peg$c92 = "true",
	        peg$c93 = { type: "literal", value: "true", description: "\"true\"" },
	        peg$c94 = function() { return true;  },
	        peg$c95 = function(head, m) { return m; },
	        peg$c96 = function(head, tail) {
	                  var result = {}, i;

	                  result[head.name] = head.value;

	                  for (i = 0; i < tail.length; i++) {
	                    result[tail[i].name] = tail[i].value;
	                  }

	                  return result;
	                },
	        peg$c97 = function(members) { return members !== null ? members: {}; },
	        peg$c98 = function(name, value) {
	                return { name: name, value: value };
	              },
	        peg$c99 = function(head, v) { return v; },
	        peg$c100 = function(head, tail) { return [head].concat(tail); },
	        peg$c101 = function(values) { return values !== null ? values : []; },
	        peg$c102 = { type: "other", description: "number" },
	        peg$c103 = function() { return parseFloat(text()); },
	        peg$c104 = /^[1-9]/,
	        peg$c105 = { type: "class", value: "[1-9]", description: "[1-9]" },
	        peg$c106 = /^[eE]/,
	        peg$c107 = { type: "class", value: "[eE]", description: "[eE]" },
	        peg$c108 = "-",
	        peg$c109 = { type: "literal", value: "-", description: "\"-\"" },
	        peg$c110 = "+",
	        peg$c111 = { type: "literal", value: "+", description: "\"+\"" },
	        peg$c112 = "0",
	        peg$c113 = { type: "literal", value: "0", description: "\"0\"" },
	        peg$c114 = { type: "other", description: "string" },
	        peg$c115 = function(chars) { return chars.join(""); },
	        peg$c116 = "\"",
	        peg$c117 = { type: "literal", value: "\"", description: "\"\\\"\"" },
	        peg$c118 = "\\",
	        peg$c119 = { type: "literal", value: "\\", description: "\"\\\\\"" },
	        peg$c120 = "/",
	        peg$c121 = { type: "literal", value: "/", description: "\"/\"" },
	        peg$c122 = "b",
	        peg$c123 = { type: "literal", value: "b", description: "\"b\"" },
	        peg$c124 = function() { return "\b"; },
	        peg$c125 = "f",
	        peg$c126 = { type: "literal", value: "f", description: "\"f\"" },
	        peg$c127 = function() { return "\f"; },
	        peg$c128 = "n",
	        peg$c129 = { type: "literal", value: "n", description: "\"n\"" },
	        peg$c130 = function() { return "\n"; },
	        peg$c131 = "r",
	        peg$c132 = { type: "literal", value: "r", description: "\"r\"" },
	        peg$c133 = function() { return "\r"; },
	        peg$c134 = "t",
	        peg$c135 = { type: "literal", value: "t", description: "\"t\"" },
	        peg$c136 = function() { return "\t"; },
	        peg$c137 = "u",
	        peg$c138 = { type: "literal", value: "u", description: "\"u\"" },
	        peg$c139 = function(digits) {
	                    return String.fromCharCode(parseInt(digits, 16));
	                  },
	        peg$c140 = function(sequence) { return sequence; },
	        peg$c141 = /^[^\0-\x1F"\\]/,
	        peg$c142 = { type: "class", value: "[^\\0-\\x1F\\x22\\x5C]", description: "[^\\0-\\x1F\\x22\\x5C]" },
	        peg$c143 = /^[0-9a-f]/i,
	        peg$c144 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },

	        peg$currPos          = 0,
	        peg$savedPos         = 0,
	        peg$posDetailsCache  = [{ line: 1, column: 1, seenCR: false }],
	        peg$maxFailPos       = 0,
	        peg$maxFailExpected  = [],
	        peg$silentFails      = 0,

	        peg$result;

	    if ("startRule" in options) {
	      if (!(options.startRule in peg$startRuleFunctions)) {
	        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
	      }

	      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
	    }

	    function text() {
	      return input.substring(peg$savedPos, peg$currPos);
	    }

	    function location() {
	      return peg$computeLocation(peg$savedPos, peg$currPos);
	    }

	    function expected(description) {
	      throw peg$buildException(
	        null,
	        [{ type: "other", description: description }],
	        input.substring(peg$savedPos, peg$currPos),
	        peg$computeLocation(peg$savedPos, peg$currPos)
	      );
	    }

	    function error(message) {
	      throw peg$buildException(
	        message,
	        null,
	        input.substring(peg$savedPos, peg$currPos),
	        peg$computeLocation(peg$savedPos, peg$currPos)
	      );
	    }

	    function peg$computePosDetails(pos) {
	      var details = peg$posDetailsCache[pos],
	          p, ch;

	      if (details) {
	        return details;
	      } else {
	        p = pos - 1;
	        while (!peg$posDetailsCache[p]) {
	          p--;
	        }

	        details = peg$posDetailsCache[p];
	        details = {
	          line:   details.line,
	          column: details.column,
	          seenCR: details.seenCR
	        };

	        while (p < pos) {
	          ch = input.charAt(p);
	          if (ch === "\n") {
	            if (!details.seenCR) { details.line++; }
	            details.column = 1;
	            details.seenCR = false;
	          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
	            details.line++;
	            details.column = 1;
	            details.seenCR = true;
	          } else {
	            details.column++;
	            details.seenCR = false;
	          }

	          p++;
	        }

	        peg$posDetailsCache[pos] = details;
	        return details;
	      }
	    }

	    function peg$computeLocation(startPos, endPos) {
	      var startPosDetails = peg$computePosDetails(startPos),
	          endPosDetails   = peg$computePosDetails(endPos);

	      return {
	        start: {
	          offset: startPos,
	          line:   startPosDetails.line,
	          column: startPosDetails.column
	        },
	        end: {
	          offset: endPos,
	          line:   endPosDetails.line,
	          column: endPosDetails.column
	        }
	      };
	    }

	    function peg$fail(expected) {
	      if (peg$currPos < peg$maxFailPos) { return; }

	      if (peg$currPos > peg$maxFailPos) {
	        peg$maxFailPos = peg$currPos;
	        peg$maxFailExpected = [];
	      }

	      peg$maxFailExpected.push(expected);
	    }

	    function peg$buildException(message, expected, found, location) {
	      function cleanupExpected(expected) {
	        var i = 1;

	        expected.sort(function(a, b) {
	          if (a.description < b.description) {
	            return -1;
	          } else if (a.description > b.description) {
	            return 1;
	          } else {
	            return 0;
	          }
	        });

	        while (i < expected.length) {
	          if (expected[i - 1] === expected[i]) {
	            expected.splice(i, 1);
	          } else {
	            i++;
	          }
	        }
	      }

	      function buildMessage(expected, found) {
	        function stringEscape(s) {
	          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

	          return s
	            .replace(/\\/g,   '\\\\')
	            .replace(/"/g,    '\\"')
	            .replace(/\x08/g, '\\b')
	            .replace(/\t/g,   '\\t')
	            .replace(/\n/g,   '\\n')
	            .replace(/\f/g,   '\\f')
	            .replace(/\r/g,   '\\r')
	            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
	            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
	            .replace(/[\u0100-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
	            .replace(/[\u1000-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
	        }

	        var expectedDescs = new Array(expected.length),
	            expectedDesc, foundDesc, i;

	        for (i = 0; i < expected.length; i++) {
	          expectedDescs[i] = expected[i].description;
	        }

	        expectedDesc = expected.length > 1
	          ? expectedDescs.slice(0, -1).join(", ")
	              + " or "
	              + expectedDescs[expected.length - 1]
	          : expectedDescs[0];

	        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

	        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
	      }

	      if (expected !== null) {
	        cleanupExpected(expected);
	      }

	      return new peg$SyntaxError(
	        message !== null ? message : buildMessage(expected, found),
	        expected,
	        found,
	        location
	      );
	    }

	    function peg$parsestart() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = [];
	      s2 = peg$parseline();
	      while (s2 !== peg$FAILED) {
	        s1.push(s2);
	        s2 = peg$parseline();
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c0();
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parseline() {
	      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.substr(peg$currPos, 7) === peg$c1) {
	          s2 = peg$c1;
	          peg$currPos += 7;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c2); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parseportName();
	          if (s3 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 58) {
	              s4 = peg$c3;
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c4); }
	            }
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parseportName();
	              if (s5 !== peg$FAILED) {
	                s6 = peg$parse_();
	                if (s6 !== peg$FAILED) {
	                  s7 = peg$parseLineTerminator();
	                  if (s7 === peg$FAILED) {
	                    s7 = null;
	                  }
	                  if (s7 !== peg$FAILED) {
	                    peg$savedPos = s0;
	                    s1 = peg$c5(s3, s5);
	                    s0 = s1;
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parse_();
	        if (s1 !== peg$FAILED) {
	          if (input.substr(peg$currPos, 7) === peg$c6) {
	            s2 = peg$c6;
	            peg$currPos += 7;
	          } else {
	            s2 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c7); }
	          }
	          if (s2 !== peg$FAILED) {
	            s3 = peg$parsenode();
	            if (s3 !== peg$FAILED) {
	              if (input.charCodeAt(peg$currPos) === 46) {
	                s4 = peg$c8;
	                peg$currPos++;
	              } else {
	                s4 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c9); }
	              }
	              if (s4 !== peg$FAILED) {
	                s5 = peg$parseportName();
	                if (s5 !== peg$FAILED) {
	                  if (input.charCodeAt(peg$currPos) === 58) {
	                    s6 = peg$c3;
	                    peg$currPos++;
	                  } else {
	                    s6 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c4); }
	                  }
	                  if (s6 !== peg$FAILED) {
	                    s7 = peg$parseportName();
	                    if (s7 !== peg$FAILED) {
	                      s8 = peg$parse_();
	                      if (s8 !== peg$FAILED) {
	                        s9 = peg$parseLineTerminator();
	                        if (s9 === peg$FAILED) {
	                          s9 = null;
	                        }
	                        if (s9 !== peg$FAILED) {
	                          peg$savedPos = s0;
	                          s1 = peg$c10(s3, s5, s7);
	                          s0 = s1;
	                        } else {
	                          peg$currPos = s0;
	                          s0 = peg$FAILED;
	                        }
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$FAILED;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	        if (s0 === peg$FAILED) {
	          s0 = peg$currPos;
	          s1 = peg$parse_();
	          if (s1 !== peg$FAILED) {
	            if (input.substr(peg$currPos, 8) === peg$c11) {
	              s2 = peg$c11;
	              peg$currPos += 8;
	            } else {
	              s2 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c12); }
	            }
	            if (s2 !== peg$FAILED) {
	              s3 = peg$parsenode();
	              if (s3 !== peg$FAILED) {
	                if (input.charCodeAt(peg$currPos) === 46) {
	                  s4 = peg$c8;
	                  peg$currPos++;
	                } else {
	                  s4 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c9); }
	                }
	                if (s4 !== peg$FAILED) {
	                  s5 = peg$parseportName();
	                  if (s5 !== peg$FAILED) {
	                    if (input.charCodeAt(peg$currPos) === 58) {
	                      s6 = peg$c3;
	                      peg$currPos++;
	                    } else {
	                      s6 = peg$FAILED;
	                      if (peg$silentFails === 0) { peg$fail(peg$c4); }
	                    }
	                    if (s6 !== peg$FAILED) {
	                      s7 = peg$parseportName();
	                      if (s7 !== peg$FAILED) {
	                        s8 = peg$parse_();
	                        if (s8 !== peg$FAILED) {
	                          s9 = peg$parseLineTerminator();
	                          if (s9 === peg$FAILED) {
	                            s9 = null;
	                          }
	                          if (s9 !== peg$FAILED) {
	                            peg$savedPos = s0;
	                            s1 = peg$c13(s3, s5, s7);
	                            s0 = s1;
	                          } else {
	                            peg$currPos = s0;
	                            s0 = peg$FAILED;
	                          }
	                        } else {
	                          peg$currPos = s0;
	                          s0 = peg$FAILED;
	                        }
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$FAILED;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	          if (s0 === peg$FAILED) {
	            s0 = peg$currPos;
	            s1 = peg$parse_();
	            if (s1 !== peg$FAILED) {
	              if (input.substr(peg$currPos, 15) === peg$c14) {
	                s2 = peg$c14;
	                peg$currPos += 15;
	              } else {
	                s2 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c15); }
	              }
	              if (s2 !== peg$FAILED) {
	                s3 = peg$parseportName();
	                if (s3 !== peg$FAILED) {
	                  s4 = peg$parse_();
	                  if (s4 !== peg$FAILED) {
	                    s5 = peg$parseLineTerminator();
	                    if (s5 === peg$FAILED) {
	                      s5 = null;
	                    }
	                    if (s5 !== peg$FAILED) {
	                      peg$savedPos = s0;
	                      s1 = peg$c16(s3);
	                      s0 = s1;
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	            if (s0 === peg$FAILED) {
	              s0 = peg$currPos;
	              s1 = peg$parse_();
	              if (s1 !== peg$FAILED) {
	                if (input.substr(peg$currPos, 16) === peg$c17) {
	                  s2 = peg$c17;
	                  peg$currPos += 16;
	                } else {
	                  s2 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c18); }
	                }
	                if (s2 !== peg$FAILED) {
	                  s3 = peg$parseportName();
	                  if (s3 !== peg$FAILED) {
	                    s4 = peg$parse_();
	                    if (s4 !== peg$FAILED) {
	                      s5 = peg$parseLineTerminator();
	                      if (s5 === peg$FAILED) {
	                        s5 = null;
	                      }
	                      if (s5 !== peg$FAILED) {
	                        peg$savedPos = s0;
	                        s1 = peg$c19(s3);
	                        s0 = s1;
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$FAILED;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	              if (s0 === peg$FAILED) {
	                s0 = peg$currPos;
	                s1 = peg$parsecomment();
	                if (s1 !== peg$FAILED) {
	                  if (peg$c20.test(input.charAt(peg$currPos))) {
	                    s2 = input.charAt(peg$currPos);
	                    peg$currPos++;
	                  } else {
	                    s2 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c21); }
	                  }
	                  if (s2 === peg$FAILED) {
	                    s2 = null;
	                  }
	                  if (s2 !== peg$FAILED) {
	                    s1 = [s1, s2];
	                    s0 = s1;
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	                if (s0 === peg$FAILED) {
	                  s0 = peg$currPos;
	                  s1 = peg$parse_();
	                  if (s1 !== peg$FAILED) {
	                    if (peg$c20.test(input.charAt(peg$currPos))) {
	                      s2 = input.charAt(peg$currPos);
	                      peg$currPos++;
	                    } else {
	                      s2 = peg$FAILED;
	                      if (peg$silentFails === 0) { peg$fail(peg$c21); }
	                    }
	                    if (s2 !== peg$FAILED) {
	                      s1 = [s1, s2];
	                      s0 = s1;
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                  if (s0 === peg$FAILED) {
	                    s0 = peg$currPos;
	                    s1 = peg$parse_();
	                    if (s1 !== peg$FAILED) {
	                      s2 = peg$parseconnection();
	                      if (s2 !== peg$FAILED) {
	                        s3 = peg$parse_();
	                        if (s3 !== peg$FAILED) {
	                          s4 = peg$parseLineTerminator();
	                          if (s4 === peg$FAILED) {
	                            s4 = null;
	                          }
	                          if (s4 !== peg$FAILED) {
	                            peg$savedPos = s0;
	                            s1 = peg$c22(s2);
	                            s0 = s1;
	                          } else {
	                            peg$currPos = s0;
	                            s0 = peg$FAILED;
	                          }
	                        } else {
	                          peg$currPos = s0;
	                          s0 = peg$FAILED;
	                        }
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$FAILED;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  }
	                }
	              }
	            }
	          }
	        }
	      }

	      return s0;
	    }

	    function peg$parseLineTerminator() {
	      var s0, s1, s2, s3, s4;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 44) {
	          s2 = peg$c23;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c24); }
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsecomment();
	          if (s3 === peg$FAILED) {
	            s3 = null;
	          }
	          if (s3 !== peg$FAILED) {
	            if (peg$c20.test(input.charAt(peg$currPos))) {
	              s4 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c21); }
	            }
	            if (s4 === peg$FAILED) {
	              s4 = null;
	            }
	            if (s4 !== peg$FAILED) {
	              s1 = [s1, s2, s3, s4];
	              s0 = s1;
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsecomment() {
	      var s0, s1, s2, s3, s4;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 35) {
	          s2 = peg$c25;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c26); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = [];
	          s4 = peg$parseanychar();
	          while (s4 !== peg$FAILED) {
	            s3.push(s4);
	            s4 = peg$parseanychar();
	          }
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseconnection() {
	      var s0, s1, s2, s3, s4, s5;

	      s0 = peg$currPos;
	      s1 = peg$parsesource();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse_();
	        if (s2 !== peg$FAILED) {
	          if (input.substr(peg$currPos, 2) === peg$c27) {
	            s3 = peg$c27;
	            peg$currPos += 2;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c28); }
	          }
	          if (s3 !== peg$FAILED) {
	            s4 = peg$parse_();
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parseconnection();
	              if (s5 !== peg$FAILED) {
	                peg$savedPos = s0;
	                s1 = peg$c29(s1, s5);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$parsedestination();
	      }

	      return s0;
	    }

	    function peg$parsesource() {
	      var s0;

	      s0 = peg$parsebridge();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseoutport();
	        if (s0 === peg$FAILED) {
	          s0 = peg$parseiip();
	        }
	      }

	      return s0;
	    }

	    function peg$parsedestination() {
	      var s0;

	      s0 = peg$parseinport();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parsebridge();
	      }

	      return s0;
	    }

	    function peg$parsebridge() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parseport__();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parsenode();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse__port();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c30(s1, s2, s3);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parseport__();
	        if (s1 === peg$FAILED) {
	          s1 = null;
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = peg$parsenodeWithComponent();
	          if (s2 !== peg$FAILED) {
	            s3 = peg$parse__port();
	            if (s3 === peg$FAILED) {
	              s3 = null;
	            }
	            if (s3 !== peg$FAILED) {
	              peg$savedPos = s0;
	              s1 = peg$c30(s1, s2, s3);
	              s0 = s1;
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      }

	      return s0;
	    }

	    function peg$parseoutport() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = peg$parsenode();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse__port();
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c31(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseinport() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = peg$parseport__();
	      if (s1 === peg$FAILED) {
	        s1 = null;
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parsenode();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c32(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseiip() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 39) {
	        s1 = peg$c33;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c34); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$parseiipchar();
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$parseiipchar();
	        }
	        if (s2 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 39) {
	            s3 = peg$c33;
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c34); }
	          }
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c35(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parseJSON_text();
	        if (s1 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c36(s1);
	        }
	        s0 = s1;
	      }

	      return s0;
	    }

	    function peg$parsenode() {
	      var s0, s1;

	      s0 = peg$currPos;
	      s1 = peg$parsenodeNameAndComponent();
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c37(s1);
	      }
	      s0 = s1;
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parsenodeName();
	        if (s1 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c37(s1);
	        }
	        s0 = s1;
	        if (s0 === peg$FAILED) {
	          s0 = peg$currPos;
	          s1 = peg$parsenodeComponent();
	          if (s1 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c37(s1);
	          }
	          s0 = s1;
	        }
	      }

	      return s0;
	    }

	    function peg$parsenodeName() {
	      var s0, s1, s2, s3, s4;

	      s0 = peg$currPos;
	      s1 = peg$currPos;
	      if (peg$c38.test(input.charAt(peg$currPos))) {
	        s2 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s2 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c39); }
	      }
	      if (s2 !== peg$FAILED) {
	        s3 = [];
	        if (peg$c40.test(input.charAt(peg$currPos))) {
	          s4 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s4 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c41); }
	        }
	        while (s4 !== peg$FAILED) {
	          s3.push(s4);
	          if (peg$c40.test(input.charAt(peg$currPos))) {
	            s4 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s4 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c41); }
	          }
	        }
	        if (s3 !== peg$FAILED) {
	          s2 = [s2, s3];
	          s1 = s2;
	        } else {
	          peg$currPos = s1;
	          s1 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s1;
	        s1 = peg$FAILED;
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c42(s1);
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parsenodeNameAndComponent() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = peg$parsenodeName();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parsecomponent();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c43(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsenodeComponent() {
	      var s0, s1;

	      s0 = peg$currPos;
	      s1 = peg$parsecomponent();
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c44(s1);
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parsenodeWithComponent() {
	      var s0;

	      s0 = peg$parsenodeNameAndComponent();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parsenodeComponent();
	      }

	      return s0;
	    }

	    function peg$parsecomponent() {
	      var s0, s1, s2, s3, s4;

	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 40) {
	        s1 = peg$c45;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c46); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        if (peg$c47.test(input.charAt(peg$currPos))) {
	          s3 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s3 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c48); }
	        }
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          if (peg$c47.test(input.charAt(peg$currPos))) {
	            s3 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c48); }
	          }
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsecompMeta();
	          if (s3 === peg$FAILED) {
	            s3 = null;
	          }
	          if (s3 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 41) {
	              s4 = peg$c49;
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c50); }
	            }
	            if (s4 !== peg$FAILED) {
	              peg$savedPos = s0;
	              s1 = peg$c51(s2, s3);
	              s0 = s1;
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsecompMeta() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 58) {
	        s1 = peg$c3;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c4); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        if (peg$c52.test(input.charAt(peg$currPos))) {
	          s3 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s3 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c53); }
	        }
	        if (s3 !== peg$FAILED) {
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            if (peg$c52.test(input.charAt(peg$currPos))) {
	              s3 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s3 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c53); }
	            }
	          }
	        } else {
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c54(s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseport() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = peg$parseportName();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseportIndex();
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c55(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseport__() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = peg$parseport();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse__();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c56(s1);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parse__port() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = peg$parse__();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseport();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c56(s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseportName() {
	      var s0, s1, s2, s3, s4;

	      s0 = peg$currPos;
	      s1 = peg$currPos;
	      if (peg$c38.test(input.charAt(peg$currPos))) {
	        s2 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s2 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c39); }
	      }
	      if (s2 !== peg$FAILED) {
	        s3 = [];
	        if (peg$c57.test(input.charAt(peg$currPos))) {
	          s4 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s4 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c58); }
	        }
	        while (s4 !== peg$FAILED) {
	          s3.push(s4);
	          if (peg$c57.test(input.charAt(peg$currPos))) {
	            s4 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s4 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c58); }
	          }
	        }
	        if (s3 !== peg$FAILED) {
	          s2 = [s2, s3];
	          s1 = s2;
	        } else {
	          peg$currPos = s1;
	          s1 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s1;
	        s1 = peg$FAILED;
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c59(s1);
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parseportIndex() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 91) {
	        s1 = peg$c60;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c61); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        if (peg$c62.test(input.charAt(peg$currPos))) {
	          s3 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s3 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c63); }
	        }
	        if (s3 !== peg$FAILED) {
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            if (peg$c62.test(input.charAt(peg$currPos))) {
	              s3 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s3 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c63); }
	            }
	          }
	        } else {
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 93) {
	            s3 = peg$c64;
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c65); }
	          }
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c66(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseanychar() {
	      var s0;

	      if (peg$c67.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c68); }
	      }

	      return s0;
	    }

	    function peg$parseiipchar() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      if (peg$c69.test(input.charAt(peg$currPos))) {
	        s1 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c70); }
	      }
	      if (s1 !== peg$FAILED) {
	        if (peg$c71.test(input.charAt(peg$currPos))) {
	          s2 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c72); }
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c73();
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        if (peg$c74.test(input.charAt(peg$currPos))) {
	          s0 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s0 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c75); }
	        }
	      }

	      return s0;
	    }

	    function peg$parse_() {
	      var s0, s1;

	      s0 = [];
	      if (input.charCodeAt(peg$currPos) === 32) {
	        s1 = peg$c76;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c77); }
	      }
	      while (s1 !== peg$FAILED) {
	        s0.push(s1);
	        if (input.charCodeAt(peg$currPos) === 32) {
	          s1 = peg$c76;
	          peg$currPos++;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c77); }
	        }
	      }
	      if (s0 === peg$FAILED) {
	        s0 = null;
	      }

	      return s0;
	    }

	    function peg$parse__() {
	      var s0, s1;

	      s0 = [];
	      if (input.charCodeAt(peg$currPos) === 32) {
	        s1 = peg$c76;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c77); }
	      }
	      if (s1 !== peg$FAILED) {
	        while (s1 !== peg$FAILED) {
	          s0.push(s1);
	          if (input.charCodeAt(peg$currPos) === 32) {
	            s1 = peg$c76;
	            peg$currPos++;
	          } else {
	            s1 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c77); }
	          }
	        }
	      } else {
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseJSON_text() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parsevalue();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c78(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsebegin_array() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 91) {
	          s2 = peg$c60;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c61); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsebegin_object() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 123) {
	          s2 = peg$c79;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c80); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseend_array() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 93) {
	          s2 = peg$c64;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c65); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseend_object() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 125) {
	          s2 = peg$c81;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c82); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsename_separator() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 58) {
	          s2 = peg$c3;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c4); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsevalue_separator() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 44) {
	          s2 = peg$c23;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c24); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsews() {
	      var s0, s1;

	      peg$silentFails++;
	      s0 = [];
	      if (peg$c84.test(input.charAt(peg$currPos))) {
	        s1 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c85); }
	      }
	      while (s1 !== peg$FAILED) {
	        s0.push(s1);
	        if (peg$c84.test(input.charAt(peg$currPos))) {
	          s1 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c85); }
	        }
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c83); }
	      }

	      return s0;
	    }

	    function peg$parsevalue() {
	      var s0;

	      s0 = peg$parsefalse();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parsenull();
	        if (s0 === peg$FAILED) {
	          s0 = peg$parsetrue();
	          if (s0 === peg$FAILED) {
	            s0 = peg$parseobject();
	            if (s0 === peg$FAILED) {
	              s0 = peg$parsearray();
	              if (s0 === peg$FAILED) {
	                s0 = peg$parsenumber();
	                if (s0 === peg$FAILED) {
	                  s0 = peg$parsestring();
	                }
	              }
	            }
	          }
	        }
	      }

	      return s0;
	    }

	    function peg$parsefalse() {
	      var s0, s1;

	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 5) === peg$c86) {
	        s1 = peg$c86;
	        peg$currPos += 5;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c87); }
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c88();
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parsenull() {
	      var s0, s1;

	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 4) === peg$c89) {
	        s1 = peg$c89;
	        peg$currPos += 4;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c90); }
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c91();
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parsetrue() {
	      var s0, s1;

	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 4) === peg$c92) {
	        s1 = peg$c92;
	        peg$currPos += 4;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c93); }
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c94();
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parseobject() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;

	      s0 = peg$currPos;
	      s1 = peg$parsebegin_object();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        s3 = peg$parsemember();
	        if (s3 !== peg$FAILED) {
	          s4 = [];
	          s5 = peg$currPos;
	          s6 = peg$parsevalue_separator();
	          if (s6 !== peg$FAILED) {
	            s7 = peg$parsemember();
	            if (s7 !== peg$FAILED) {
	              peg$savedPos = s5;
	              s6 = peg$c95(s3, s7);
	              s5 = s6;
	            } else {
	              peg$currPos = s5;
	              s5 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s5;
	            s5 = peg$FAILED;
	          }
	          while (s5 !== peg$FAILED) {
	            s4.push(s5);
	            s5 = peg$currPos;
	            s6 = peg$parsevalue_separator();
	            if (s6 !== peg$FAILED) {
	              s7 = peg$parsemember();
	              if (s7 !== peg$FAILED) {
	                peg$savedPos = s5;
	                s6 = peg$c95(s3, s7);
	                s5 = s6;
	              } else {
	                peg$currPos = s5;
	                s5 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s5;
	              s5 = peg$FAILED;
	            }
	          }
	          if (s4 !== peg$FAILED) {
	            peg$savedPos = s2;
	            s3 = peg$c96(s3, s4);
	            s2 = s3;
	          } else {
	            peg$currPos = s2;
	            s2 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parseend_object();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c97(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsemember() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsestring();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parsename_separator();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsevalue();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c98(s1, s3);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsearray() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;

	      s0 = peg$currPos;
	      s1 = peg$parsebegin_array();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        s3 = peg$parsevalue();
	        if (s3 !== peg$FAILED) {
	          s4 = [];
	          s5 = peg$currPos;
	          s6 = peg$parsevalue_separator();
	          if (s6 !== peg$FAILED) {
	            s7 = peg$parsevalue();
	            if (s7 !== peg$FAILED) {
	              peg$savedPos = s5;
	              s6 = peg$c99(s3, s7);
	              s5 = s6;
	            } else {
	              peg$currPos = s5;
	              s5 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s5;
	            s5 = peg$FAILED;
	          }
	          while (s5 !== peg$FAILED) {
	            s4.push(s5);
	            s5 = peg$currPos;
	            s6 = peg$parsevalue_separator();
	            if (s6 !== peg$FAILED) {
	              s7 = peg$parsevalue();
	              if (s7 !== peg$FAILED) {
	                peg$savedPos = s5;
	                s6 = peg$c99(s3, s7);
	                s5 = s6;
	              } else {
	                peg$currPos = s5;
	                s5 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s5;
	              s5 = peg$FAILED;
	            }
	          }
	          if (s4 !== peg$FAILED) {
	            peg$savedPos = s2;
	            s3 = peg$c100(s3, s4);
	            s2 = s3;
	          } else {
	            peg$currPos = s2;
	            s2 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parseend_array();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c101(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsenumber() {
	      var s0, s1, s2, s3, s4;

	      peg$silentFails++;
	      s0 = peg$currPos;
	      s1 = peg$parseminus();
	      if (s1 === peg$FAILED) {
	        s1 = null;
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseint();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsefrac();
	          if (s3 === peg$FAILED) {
	            s3 = null;
	          }
	          if (s3 !== peg$FAILED) {
	            s4 = peg$parseexp();
	            if (s4 === peg$FAILED) {
	              s4 = null;
	            }
	            if (s4 !== peg$FAILED) {
	              peg$savedPos = s0;
	              s1 = peg$c103();
	              s0 = s1;
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c102); }
	      }

	      return s0;
	    }

	    function peg$parsedecimal_point() {
	      var s0;

	      if (input.charCodeAt(peg$currPos) === 46) {
	        s0 = peg$c8;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c9); }
	      }

	      return s0;
	    }

	    function peg$parsedigit1_9() {
	      var s0;

	      if (peg$c104.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c105); }
	      }

	      return s0;
	    }

	    function peg$parsee() {
	      var s0;

	      if (peg$c106.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c107); }
	      }

	      return s0;
	    }

	    function peg$parseexp() {
	      var s0, s1, s2, s3, s4;

	      s0 = peg$currPos;
	      s1 = peg$parsee();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseminus();
	        if (s2 === peg$FAILED) {
	          s2 = peg$parseplus();
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = [];
	          s4 = peg$parseDIGIT();
	          if (s4 !== peg$FAILED) {
	            while (s4 !== peg$FAILED) {
	              s3.push(s4);
	              s4 = peg$parseDIGIT();
	            }
	          } else {
	            s3 = peg$FAILED;
	          }
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsefrac() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsedecimal_point();
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$parseDIGIT();
	        if (s3 !== peg$FAILED) {
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            s3 = peg$parseDIGIT();
	          }
	        } else {
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseint() {
	      var s0, s1, s2, s3;

	      s0 = peg$parsezero();
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parsedigit1_9();
	        if (s1 !== peg$FAILED) {
	          s2 = [];
	          s3 = peg$parseDIGIT();
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            s3 = peg$parseDIGIT();
	          }
	          if (s2 !== peg$FAILED) {
	            s1 = [s1, s2];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      }

	      return s0;
	    }

	    function peg$parseminus() {
	      var s0;

	      if (input.charCodeAt(peg$currPos) === 45) {
	        s0 = peg$c108;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c109); }
	      }

	      return s0;
	    }

	    function peg$parseplus() {
	      var s0;

	      if (input.charCodeAt(peg$currPos) === 43) {
	        s0 = peg$c110;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c111); }
	      }

	      return s0;
	    }

	    function peg$parsezero() {
	      var s0;

	      if (input.charCodeAt(peg$currPos) === 48) {
	        s0 = peg$c112;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c113); }
	      }

	      return s0;
	    }

	    function peg$parsestring() {
	      var s0, s1, s2, s3;

	      peg$silentFails++;
	      s0 = peg$currPos;
	      s1 = peg$parsequotation_mark();
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$parsechar();
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$parsechar();
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsequotation_mark();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c115(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c114); }
	      }

	      return s0;
	    }

	    function peg$parsechar() {
	      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

	      s0 = peg$parseunescaped();
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parseescape();
	        if (s1 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 34) {
	            s2 = peg$c116;
	            peg$currPos++;
	          } else {
	            s2 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c117); }
	          }
	          if (s2 === peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 92) {
	              s2 = peg$c118;
	              peg$currPos++;
	            } else {
	              s2 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c119); }
	            }
	            if (s2 === peg$FAILED) {
	              if (input.charCodeAt(peg$currPos) === 47) {
	                s2 = peg$c120;
	                peg$currPos++;
	              } else {
	                s2 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c121); }
	              }
	              if (s2 === peg$FAILED) {
	                s2 = peg$currPos;
	                if (input.charCodeAt(peg$currPos) === 98) {
	                  s3 = peg$c122;
	                  peg$currPos++;
	                } else {
	                  s3 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c123); }
	                }
	                if (s3 !== peg$FAILED) {
	                  peg$savedPos = s2;
	                  s3 = peg$c124();
	                }
	                s2 = s3;
	                if (s2 === peg$FAILED) {
	                  s2 = peg$currPos;
	                  if (input.charCodeAt(peg$currPos) === 102) {
	                    s3 = peg$c125;
	                    peg$currPos++;
	                  } else {
	                    s3 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c126); }
	                  }
	                  if (s3 !== peg$FAILED) {
	                    peg$savedPos = s2;
	                    s3 = peg$c127();
	                  }
	                  s2 = s3;
	                  if (s2 === peg$FAILED) {
	                    s2 = peg$currPos;
	                    if (input.charCodeAt(peg$currPos) === 110) {
	                      s3 = peg$c128;
	                      peg$currPos++;
	                    } else {
	                      s3 = peg$FAILED;
	                      if (peg$silentFails === 0) { peg$fail(peg$c129); }
	                    }
	                    if (s3 !== peg$FAILED) {
	                      peg$savedPos = s2;
	                      s3 = peg$c130();
	                    }
	                    s2 = s3;
	                    if (s2 === peg$FAILED) {
	                      s2 = peg$currPos;
	                      if (input.charCodeAt(peg$currPos) === 114) {
	                        s3 = peg$c131;
	                        peg$currPos++;
	                      } else {
	                        s3 = peg$FAILED;
	                        if (peg$silentFails === 0) { peg$fail(peg$c132); }
	                      }
	                      if (s3 !== peg$FAILED) {
	                        peg$savedPos = s2;
	                        s3 = peg$c133();
	                      }
	                      s2 = s3;
	                      if (s2 === peg$FAILED) {
	                        s2 = peg$currPos;
	                        if (input.charCodeAt(peg$currPos) === 116) {
	                          s3 = peg$c134;
	                          peg$currPos++;
	                        } else {
	                          s3 = peg$FAILED;
	                          if (peg$silentFails === 0) { peg$fail(peg$c135); }
	                        }
	                        if (s3 !== peg$FAILED) {
	                          peg$savedPos = s2;
	                          s3 = peg$c136();
	                        }
	                        s2 = s3;
	                        if (s2 === peg$FAILED) {
	                          s2 = peg$currPos;
	                          if (input.charCodeAt(peg$currPos) === 117) {
	                            s3 = peg$c137;
	                            peg$currPos++;
	                          } else {
	                            s3 = peg$FAILED;
	                            if (peg$silentFails === 0) { peg$fail(peg$c138); }
	                          }
	                          if (s3 !== peg$FAILED) {
	                            s4 = peg$currPos;
	                            s5 = peg$currPos;
	                            s6 = peg$parseHEXDIG();
	                            if (s6 !== peg$FAILED) {
	                              s7 = peg$parseHEXDIG();
	                              if (s7 !== peg$FAILED) {
	                                s8 = peg$parseHEXDIG();
	                                if (s8 !== peg$FAILED) {
	                                  s9 = peg$parseHEXDIG();
	                                  if (s9 !== peg$FAILED) {
	                                    s6 = [s6, s7, s8, s9];
	                                    s5 = s6;
	                                  } else {
	                                    peg$currPos = s5;
	                                    s5 = peg$FAILED;
	                                  }
	                                } else {
	                                  peg$currPos = s5;
	                                  s5 = peg$FAILED;
	                                }
	                              } else {
	                                peg$currPos = s5;
	                                s5 = peg$FAILED;
	                              }
	                            } else {
	                              peg$currPos = s5;
	                              s5 = peg$FAILED;
	                            }
	                            if (s5 !== peg$FAILED) {
	                              s4 = input.substring(s4, peg$currPos);
	                            } else {
	                              s4 = s5;
	                            }
	                            if (s4 !== peg$FAILED) {
	                              peg$savedPos = s2;
	                              s3 = peg$c139(s4);
	                              s2 = s3;
	                            } else {
	                              peg$currPos = s2;
	                              s2 = peg$FAILED;
	                            }
	                          } else {
	                            peg$currPos = s2;
	                            s2 = peg$FAILED;
	                          }
	                        }
	                      }
	                    }
	                  }
	                }
	              }
	            }
	          }
	          if (s2 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c140(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      }

	      return s0;
	    }

	    function peg$parseescape() {
	      var s0;

	      if (input.charCodeAt(peg$currPos) === 92) {
	        s0 = peg$c118;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c119); }
	      }

	      return s0;
	    }

	    function peg$parsequotation_mark() {
	      var s0;

	      if (input.charCodeAt(peg$currPos) === 34) {
	        s0 = peg$c116;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c117); }
	      }

	      return s0;
	    }

	    function peg$parseunescaped() {
	      var s0;

	      if (peg$c141.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c142); }
	      }

	      return s0;
	    }

	    function peg$parseDIGIT() {
	      var s0;

	      if (peg$c62.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c63); }
	      }

	      return s0;
	    }

	    function peg$parseHEXDIG() {
	      var s0;

	      if (peg$c143.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c144); }
	      }

	      return s0;
	    }


	      var parser, edges, nodes;

	      var defaultInPort = "IN", defaultOutPort = "OUT";

	      parser = this;
	      delete parser.exports;
	      delete parser.inports;
	      delete parser.outports;

	      edges = parser.edges = [];

	      nodes = {};

	      var serialize, indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

	      parser.serialize = function(graph) {
	        var conn, getInOutName, getName, i, inPort, input, len, name, namedComponents, outPort, output, process, ref, ref1, ref2, src, srcName, srcPort, srcProcess, tgt, tgtName, tgtPort, tgtProcess;
	        if (options == null) {
	          options = {};
	        }
	        if (typeof(graph) === 'string') {
	          input = JSON.parse(graph);
	        } else {
	          input = graph;
	        }
	        namedComponents = [];
	        output = "";
	        getName = function(name) {
	          if (input.processes[name].metadata != null) {
	            name = input.processes[name].metadata.label;
	          }
	          if (name.indexOf('/') > -1) {
	            name = name.split('/').pop();
	          }
	          return name;
	        };
	        getInOutName = function(name, data) {
	          if ((data.process != null) && (input.processes[data.process].metadata != null)) {
	            name = input.processes[data.process].metadata.label;
	          } else if (data.process != null) {
	            name = data.process;
	          }
	          if (name.indexOf('/') > -1) {
	            name = name.split('/').pop();
	          }
	          return name;
	        };
	        ref = input.inports;
	        for (name in ref) {
	          inPort = ref[name];
	          process = getInOutName(name, inPort);
	          name = name.toUpperCase();
	          inPort.port = inPort.port.toUpperCase();
	          output += "INPORT=" + process + "." + inPort.port + ":" + name + "\n";
	        }
	        ref1 = input.outports;
	        for (name in ref1) {
	          outPort = ref1[name];
	          process = getInOutName(name, inPort);
	          name = name.toUpperCase();
	          outPort.port = outPort.port.toUpperCase();
	          output += "OUTPORT=" + process + "." + outPort.port + ":" + name + "\n";
	        }
	        output += "\n";
	        ref2 = input.connections;
	        for (i = 0, len = ref2.length; i < len; i++) {
	          conn = ref2[i];
	          if (conn.data != null) {
	            tgtPort = conn.tgt.port.toUpperCase();
	            tgtName = conn.tgt.process;
	            tgtProcess = input.processes[tgtName].component;
	            tgt = getName(tgtName);
	            if (indexOf.call(namedComponents, tgtProcess) < 0) {
	              tgt += "(" + tgtProcess + ")";
	              namedComponents.push(tgtProcess);
	            }
	            output += '"' + conn.data + '"' + (" -> " + tgtPort + " " + tgt + "\n");
	          } else {
	            srcPort = conn.src.port.toUpperCase();
	            srcName = conn.src.process;
	            srcProcess = input.processes[srcName].component;
	            src = getName(srcName);
	            if (indexOf.call(namedComponents, srcProcess) < 0) {
	              src += "(" + srcProcess + ")";
	              namedComponents.push(srcProcess);
	            }
	            tgtPort = conn.tgt.port.toUpperCase();
	            tgtName = conn.tgt.process;
	            tgtProcess = input.processes[tgtName].component;
	            tgt = getName(tgtName);
	            if (indexOf.call(namedComponents, tgtProcess) < 0) {
	              tgt += "(" + tgtProcess + ")";
	              namedComponents.push(tgtProcess);
	            }
	            output += src + " " + srcPort + " -> " + tgtPort + " " + tgt + "\n";
	          }
	        }
	        return output;
	      };

	      parser.addNode = function (nodeName, comp) {
	        if (!nodes[nodeName]) {
	          nodes[nodeName] = {}
	        }
	        if (!!comp.comp) {
	          nodes[nodeName].component = comp.comp;
	        }
	        if (!!comp.meta) {
	          var metadata = {};
	          for (var i = 0; i < comp.meta.length; i++) {
	            var item = comp.meta[i].split('=');
	            if (item.length === 1) {
	              item = ['routes', item[0]];
	            }
	            var key = item[0];
	            var value = item[1];
	            if (key==='x' || key==='y') {
	              value = parseFloat(value);
	            }
	            metadata[key] = value;
	          }
	          nodes[nodeName].metadata=metadata;
	        }

	      }

	      var anonymousIndexes = {};
	      var anonymousNodeNames = {};
	      parser.addAnonymousNode = function(comp, offset) {
	          if (!anonymousNodeNames[offset]) {
	              var componentName = comp.comp.replace(/[^a-zA-Z0-9]+/, "_");
	              anonymousIndexes[componentName] = (anonymousIndexes[componentName] || 0) + 1;
	              anonymousNodeNames[offset] = "_" + componentName + "_" + anonymousIndexes[componentName];
	              this.addNode(anonymousNodeNames[offset], comp);
	          }
	          return anonymousNodeNames[offset];
	      }

	      parser.getResult = function () {
	        var result = {
	          processes: nodes,
	          connections: parser.processEdges(),
	          exports: parser.exports,
	          inports: parser.inports,
	          outports: parser.outports
	        };

	        var validateSchema = parser.validateSchema; // default
	        if (typeof(options.validateSchema) !== 'undefined') { validateSchema = options.validateSchema; } // explicit option
	        if (validateSchema) {
	          if (typeof(tv4) === 'undefined') {
	            var tv4 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"tv4\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	          }
	          var schema = __webpack_require__(13);
	          var validation = tv4.validateMultiple(result, schema);
	          if (!validation.valid) {
	            throw new Error("fbp: Did not validate againt graph schema:\n" + JSON.stringify(validation.errors, null, 2));
	          }
	        }
	        result.caseSensitive = options.caseSensitive;
	        return result;
	      }

	      var flatten = function (array, isShallow) {
	        var index = -1,
	          length = array ? array.length : 0,
	          result = [];

	        while (++index < length) {
	          var value = array[index];

	          if (value instanceof Array) {
	            Array.prototype.push.apply(result, isShallow ? value : flatten(value));
	          }
	          else {
	            result.push(value);
	          }
	        }
	        return result;
	      }

	      parser.registerExports = function (priv, pub) {
	        if (!parser.exports) {
	          parser.exports = [];
	        }

	        if (!options.caseSensitive) {
	          priv = priv.toLowerCase();
	          pub = pub.toLowerCase();
	        }

	        parser.exports.push({private:priv, public:pub});
	      }
	      parser.registerInports = function (node, port, pub) {
	        if (!parser.inports) {
	          parser.inports = {};
	        }

	        if (!options.caseSensitive) {
	          pub = pub.toLowerCase();
	          port = port.toLowerCase();
	        }

	        parser.inports[pub] = {process:node, port:port};
	      }
	      parser.registerOutports = function (node, port, pub) {
	        if (!parser.outports) {
	          parser.outports = {};
	        }

	        if (!options.caseSensitive) {
	          pub = pub.toLowerCase();
	          port = port.toLowerCase();
	        }

	        parser.outports[pub] = {process:node, port:port};
	      }

	      parser.registerEdges = function (edges) {
	        if (Array.isArray(edges)) {
	          edges.forEach(function (o, i) {
	            parser.edges.push(o);
	          });
	        }
	      }

	      parser.processEdges = function () {
	        var flats, grouped;
	        flats = flatten(parser.edges);
	        grouped = [];
	        var current = {};
	        for (var i = 1; i < flats.length; i += 1) {
	            // skip over default ports at the beginning of lines (could also handle this in grammar)
	            if (("src" in flats[i - 1] || "data" in flats[i - 1]) && "tgt" in flats[i]) {
	                flats[i - 1].tgt = flats[i].tgt;
	                grouped.push(flats[i - 1]);
	                i++;
	            }
	        }
	        return grouped;
	      }

	      function makeName(s) {
	        return s[0] + s[1].join("");
	      }

	      function makePort(process, port, defaultPort) {
	        if (!options.caseSensitive) {
	          defaultPort = defaultPort.toLowerCase()
	        }
	        var p = {
	            process: process,
	            port: port ? port.port : defaultPort
	        };
	        if (port && port.index != null) {
	            p.index = port.index;
	        }
	        return p;
	    }

	      function makeInPort(process, port) {
	          return makePort(process, port, defaultInPort);
	      }
	      function makeOutPort(process, port) {
	          return makePort(process, port, defaultOutPort);
	      }


	    peg$result = peg$startRuleFunction();

	    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
	      return peg$result;
	    } else {
	      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
	        peg$fail({ type: "end", description: "end of input" });
	      }

	      throw peg$buildException(
	        null,
	        peg$maxFailExpected,
	        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
	        peg$maxFailPos < input.length
	          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
	          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
	      );
	    }
	  }

	  return {
	    SyntaxError: peg$SyntaxError,
	    parse:       peg$parse
	  };
	})();

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = {
		"$schema": "http://json-schema.org/draft-04/schema",
		"id": "graph.json",
		"title": "FBP graph",
		"description": "A graph of FBP processes and connections between them.\nThis is the primary way of specifying FBP programs.\n",
		"name": "graph",
		"type": "object",
		"additionalProperties": false,
		"properties": {
			"properties": {
				"type": "object",
				"description": "User-defined properties attached to the graph.",
				"additionalProperties": true,
				"properties": {
					"name": {
						"type": "string"
					}
				}
			},
			"inports": {
				"type": [
					"object",
					"undefined"
				],
				"description": "Exported inports of the graph",
				"additionalProperties": true,
				"patternProperties": {
					"[a-z0-9]+": {
						"type": "object",
						"properties": {
							"process": {
								"type": "string"
							},
							"port": {
								"type": "string"
							},
							"metadata": {
								"type": "object",
								"additionalProperties": true
							}
						}
					}
				}
			},
			"outports": {
				"type": [
					"object",
					"undefined"
				],
				"description": "Exported outports of the graph",
				"additionalProperties": true,
				"patternProperties": {
					"[a-z0-9]+": {
						"type": "object",
						"properties": {
							"process": {
								"type": "string"
							},
							"port": {
								"type": "string"
							},
							"metadata": {
								"type": "object",
								"additionalProperties": true
							}
						}
					}
				}
			},
			"exports": {
				"type": [
					"array",
					"undefined"
				],
				"description": "Deprecated, use inports and outports instead"
			},
			"groups": {
				"type": "array",
				"description": "List of groups of processes",
				"items": {
					"type": "object",
					"additionalProperties": false,
					"properties": {
						"name": {
							"type": "string"
						},
						"nodes": {
							"type": "array",
							"items": {
								"type": "string"
							}
						},
						"metadata": {
							"additionalProperties": true
						}
					}
				}
			},
			"processes": {
				"type": "object",
				"description": "The processes of this graph.\nEach process is an instance of a component.\n",
				"additionalProperties": false,
				"patternProperties": {
					"[a-zA-Z0-9_]+": {
						"type": "object",
						"properties": {
							"component": {
								"type": "string"
							},
							"metadata": {
								"type": "object",
								"additionalProperties": true
							}
						}
					}
				}
			},
			"connections": {
				"type": "array",
				"description": "Connections of the graph.\nA connection either connects ports of two processes, or specifices an IIP as initial input packet to a port.\n",
				"items": {
					"type": "object",
					"additionalProperties": false,
					"properties": {
						"src": {
							"type": "object",
							"additionalProperties": false,
							"properties": {
								"process": {
									"type": "string"
								},
								"port": {
									"type": "string"
								},
								"index": {
									"type": "integer"
								}
							}
						},
						"tgt": {
							"type": "object",
							"additionalProperties": false,
							"properties": {
								"process": {
									"type": "string"
								},
								"port": {
									"type": "string"
								},
								"index": {
									"type": "integer"
								}
							}
						},
						"data": {},
						"metadata": {
							"type": "object",
							"additionalProperties": true
						}
					}
				}
			}
		}
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var EventEmitter, Journal, JournalStore, MemoryJournalStore, calculateMeta, clone, entryToPrettyString,
	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	    hasProp = {}.hasOwnProperty,
	    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

	  EventEmitter = __webpack_require__(3).EventEmitter;

	  clone = __webpack_require__(4);

	  entryToPrettyString = function(entry) {
	    var a;
	    a = entry.args;
	    switch (entry.cmd) {
	      case 'addNode':
	        return a.id + "(" + a.component + ")";
	      case 'removeNode':
	        return "DEL " + a.id + "(" + a.component + ")";
	      case 'renameNode':
	        return "RENAME " + a.oldId + " " + a.newId;
	      case 'changeNode':
	        return "META " + a.id;
	      case 'addEdge':
	        return a.from.node + " " + a.from.port + " -> " + a.to.port + " " + a.to.node;
	      case 'removeEdge':
	        return a.from.node + " " + a.from.port + " -X> " + a.to.port + " " + a.to.node;
	      case 'changeEdge':
	        return "META " + a.from.node + " " + a.from.port + " -> " + a.to.port + " " + a.to.node;
	      case 'addInitial':
	        return "'" + a.from.data + "' -> " + a.to.port + " " + a.to.node;
	      case 'removeInitial':
	        return "'" + a.from.data + "' -X> " + a.to.port + " " + a.to.node;
	      case 'startTransaction':
	        return ">>> " + entry.rev + ": " + a.id;
	      case 'endTransaction':
	        return "<<< " + entry.rev + ": " + a.id;
	      case 'changeProperties':
	        return "PROPERTIES";
	      case 'addGroup':
	        return "GROUP " + a.name;
	      case 'renameGroup':
	        return "RENAME GROUP " + a.oldName + " " + a.newName;
	      case 'removeGroup':
	        return "DEL GROUP " + a.name;
	      case 'changeGroup':
	        return "META GROUP " + a.name;
	      case 'addInport':
	        return "INPORT " + a.name;
	      case 'removeInport':
	        return "DEL INPORT " + a.name;
	      case 'renameInport':
	        return "RENAME INPORT " + a.oldId + " " + a.newId;
	      case 'changeInport':
	        return "META INPORT " + a.name;
	      case 'addOutport':
	        return "OUTPORT " + a.name;
	      case 'removeOutport':
	        return "DEL OUTPORT " + a.name;
	      case 'renameOutport':
	        return "RENAME OUTPORT " + a.oldId + " " + a.newId;
	      case 'changeOutport':
	        return "META OUTPORT " + a.name;
	      default:
	        throw new Error("Unknown journal entry: " + entry.cmd);
	    }
	  };

	  calculateMeta = function(oldMeta, newMeta) {
	    var k, setMeta, v;
	    setMeta = {};
	    for (k in oldMeta) {
	      v = oldMeta[k];
	      setMeta[k] = null;
	    }
	    for (k in newMeta) {
	      v = newMeta[k];
	      setMeta[k] = v;
	    }
	    return setMeta;
	  };

	  JournalStore = (function(superClass) {
	    extend(JournalStore, superClass);

	    JournalStore.prototype.lastRevision = 0;

	    function JournalStore(graph1) {
	      this.graph = graph1;
	      this.lastRevision = 0;
	    }

	    JournalStore.prototype.putTransaction = function(revId, entries) {
	      if (revId > this.lastRevision) {
	        this.lastRevision = revId;
	      }
	      return this.emit('transaction', revId);
	    };

	    JournalStore.prototype.fetchTransaction = function(revId, entries) {};

	    return JournalStore;

	  })(EventEmitter);

	  MemoryJournalStore = (function(superClass) {
	    extend(MemoryJournalStore, superClass);

	    function MemoryJournalStore(graph) {
	      MemoryJournalStore.__super__.constructor.call(this, graph);
	      this.transactions = [];
	    }

	    MemoryJournalStore.prototype.putTransaction = function(revId, entries) {
	      MemoryJournalStore.__super__.putTransaction.call(this, revId, entries);
	      return this.transactions[revId] = entries;
	    };

	    MemoryJournalStore.prototype.fetchTransaction = function(revId) {
	      return this.transactions[revId];
	    };

	    return MemoryJournalStore;

	  })(JournalStore);

	  Journal = (function(superClass) {
	    extend(Journal, superClass);

	    Journal.prototype.graph = null;

	    Journal.prototype.entries = [];

	    Journal.prototype.subscribed = true;

	    function Journal(graph, metadata, store) {
	      this.endTransaction = bind(this.endTransaction, this);
	      this.startTransaction = bind(this.startTransaction, this);
	      var edge, group, iip, j, k, l, len, len1, len2, len3, m, n, node, ref, ref1, ref2, ref3, ref4, ref5, v;
	      this.graph = graph;
	      this.entries = [];
	      this.subscribed = true;
	      this.store = store || new MemoryJournalStore(this.graph);
	      if (this.store.transactions.length === 0) {
	        this.currentRevision = -1;
	        this.startTransaction('initial', metadata);
	        ref = this.graph.nodes;
	        for (j = 0, len = ref.length; j < len; j++) {
	          node = ref[j];
	          this.appendCommand('addNode', node);
	        }
	        ref1 = this.graph.edges;
	        for (l = 0, len1 = ref1.length; l < len1; l++) {
	          edge = ref1[l];
	          this.appendCommand('addEdge', edge);
	        }
	        ref2 = this.graph.initializers;
	        for (m = 0, len2 = ref2.length; m < len2; m++) {
	          iip = ref2[m];
	          this.appendCommand('addInitial', iip);
	        }
	        if (Object.keys(this.graph.properties).length > 0) {
	          this.appendCommand('changeProperties', this.graph.properties, {});
	        }
	        ref3 = this.graph.inports;
	        for (k in ref3) {
	          v = ref3[k];
	          this.appendCommand('addInport', {
	            name: k,
	            port: v
	          });
	        }
	        ref4 = this.graph.outports;
	        for (k in ref4) {
	          v = ref4[k];
	          this.appendCommand('addOutport', {
	            name: k,
	            port: v
	          });
	        }
	        ref5 = this.graph.groups;
	        for (n = 0, len3 = ref5.length; n < len3; n++) {
	          group = ref5[n];
	          this.appendCommand('addGroup', group);
	        }
	        this.endTransaction('initial', metadata);
	      } else {
	        this.currentRevision = this.store.lastRevision;
	      }
	      this.graph.on('addNode', (function(_this) {
	        return function(node) {
	          return _this.appendCommand('addNode', node);
	        };
	      })(this));
	      this.graph.on('removeNode', (function(_this) {
	        return function(node) {
	          return _this.appendCommand('removeNode', node);
	        };
	      })(this));
	      this.graph.on('renameNode', (function(_this) {
	        return function(oldId, newId) {
	          var args;
	          args = {
	            oldId: oldId,
	            newId: newId
	          };
	          return _this.appendCommand('renameNode', args);
	        };
	      })(this));
	      this.graph.on('changeNode', (function(_this) {
	        return function(node, oldMeta) {
	          return _this.appendCommand('changeNode', {
	            id: node.id,
	            "new": node.metadata,
	            old: oldMeta
	          });
	        };
	      })(this));
	      this.graph.on('addEdge', (function(_this) {
	        return function(edge) {
	          return _this.appendCommand('addEdge', edge);
	        };
	      })(this));
	      this.graph.on('removeEdge', (function(_this) {
	        return function(edge) {
	          return _this.appendCommand('removeEdge', edge);
	        };
	      })(this));
	      this.graph.on('changeEdge', (function(_this) {
	        return function(edge, oldMeta) {
	          return _this.appendCommand('changeEdge', {
	            from: edge.from,
	            to: edge.to,
	            "new": edge.metadata,
	            old: oldMeta
	          });
	        };
	      })(this));
	      this.graph.on('addInitial', (function(_this) {
	        return function(iip) {
	          return _this.appendCommand('addInitial', iip);
	        };
	      })(this));
	      this.graph.on('removeInitial', (function(_this) {
	        return function(iip) {
	          return _this.appendCommand('removeInitial', iip);
	        };
	      })(this));
	      this.graph.on('changeProperties', (function(_this) {
	        return function(newProps, oldProps) {
	          return _this.appendCommand('changeProperties', {
	            "new": newProps,
	            old: oldProps
	          });
	        };
	      })(this));
	      this.graph.on('addGroup', (function(_this) {
	        return function(group) {
	          return _this.appendCommand('addGroup', group);
	        };
	      })(this));
	      this.graph.on('renameGroup', (function(_this) {
	        return function(oldName, newName) {
	          return _this.appendCommand('renameGroup', {
	            oldName: oldName,
	            newName: newName
	          });
	        };
	      })(this));
	      this.graph.on('removeGroup', (function(_this) {
	        return function(group) {
	          return _this.appendCommand('removeGroup', group);
	        };
	      })(this));
	      this.graph.on('changeGroup', (function(_this) {
	        return function(group, oldMeta) {
	          return _this.appendCommand('changeGroup', {
	            name: group.name,
	            "new": group.metadata,
	            old: oldMeta
	          });
	        };
	      })(this));
	      this.graph.on('addExport', (function(_this) {
	        return function(exported) {
	          return _this.appendCommand('addExport', exported);
	        };
	      })(this));
	      this.graph.on('removeExport', (function(_this) {
	        return function(exported) {
	          return _this.appendCommand('removeExport', exported);
	        };
	      })(this));
	      this.graph.on('addInport', (function(_this) {
	        return function(name, port) {
	          return _this.appendCommand('addInport', {
	            name: name,
	            port: port
	          });
	        };
	      })(this));
	      this.graph.on('removeInport', (function(_this) {
	        return function(name, port) {
	          return _this.appendCommand('removeInport', {
	            name: name,
	            port: port
	          });
	        };
	      })(this));
	      this.graph.on('renameInport', (function(_this) {
	        return function(oldId, newId) {
	          return _this.appendCommand('renameInport', {
	            oldId: oldId,
	            newId: newId
	          });
	        };
	      })(this));
	      this.graph.on('changeInport', (function(_this) {
	        return function(name, port, oldMeta) {
	          return _this.appendCommand('changeInport', {
	            name: name,
	            "new": port.metadata,
	            old: oldMeta
	          });
	        };
	      })(this));
	      this.graph.on('addOutport', (function(_this) {
	        return function(name, port) {
	          return _this.appendCommand('addOutport', {
	            name: name,
	            port: port
	          });
	        };
	      })(this));
	      this.graph.on('removeOutport', (function(_this) {
	        return function(name, port) {
	          return _this.appendCommand('removeOutport', {
	            name: name,
	            port: port
	          });
	        };
	      })(this));
	      this.graph.on('renameOutport', (function(_this) {
	        return function(oldId, newId) {
	          return _this.appendCommand('renameOutport', {
	            oldId: oldId,
	            newId: newId
	          });
	        };
	      })(this));
	      this.graph.on('changeOutport', (function(_this) {
	        return function(name, port, oldMeta) {
	          return _this.appendCommand('changeOutport', {
	            name: name,
	            "new": port.metadata,
	            old: oldMeta
	          });
	        };
	      })(this));
	      this.graph.on('startTransaction', (function(_this) {
	        return function(id, meta) {
	          return _this.startTransaction(id, meta);
	        };
	      })(this));
	      this.graph.on('endTransaction', (function(_this) {
	        return function(id, meta) {
	          return _this.endTransaction(id, meta);
	        };
	      })(this));
	    }

	    Journal.prototype.startTransaction = function(id, meta) {
	      if (!this.subscribed) {
	        return;
	      }
	      if (this.entries.length > 0) {
	        throw Error("Inconsistent @entries");
	      }
	      this.currentRevision++;
	      return this.appendCommand('startTransaction', {
	        id: id,
	        metadata: meta
	      }, this.currentRevision);
	    };

	    Journal.prototype.endTransaction = function(id, meta) {
	      if (!this.subscribed) {
	        return;
	      }
	      this.appendCommand('endTransaction', {
	        id: id,
	        metadata: meta
	      }, this.currentRevision);
	      this.store.putTransaction(this.currentRevision, this.entries);
	      return this.entries = [];
	    };

	    Journal.prototype.appendCommand = function(cmd, args, rev) {
	      var entry;
	      if (!this.subscribed) {
	        return;
	      }
	      entry = {
	        cmd: cmd,
	        args: clone(args)
	      };
	      if (rev != null) {
	        entry.rev = rev;
	      }
	      return this.entries.push(entry);
	    };

	    Journal.prototype.executeEntry = function(entry) {
	      var a;
	      a = entry.args;
	      switch (entry.cmd) {
	        case 'addNode':
	          return this.graph.addNode(a.id, a.component);
	        case 'removeNode':
	          return this.graph.removeNode(a.id);
	        case 'renameNode':
	          return this.graph.renameNode(a.oldId, a.newId);
	        case 'changeNode':
	          return this.graph.setNodeMetadata(a.id, calculateMeta(a.old, a["new"]));
	        case 'addEdge':
	          return this.graph.addEdge(a.from.node, a.from.port, a.to.node, a.to.port);
	        case 'removeEdge':
	          return this.graph.removeEdge(a.from.node, a.from.port, a.to.node, a.to.port);
	        case 'changeEdge':
	          return this.graph.setEdgeMetadata(a.from.node, a.from.port, a.to.node, a.to.port, calculateMeta(a.old, a["new"]));
	        case 'addInitial':
	          return this.graph.addInitial(a.from.data, a.to.node, a.to.port);
	        case 'removeInitial':
	          return this.graph.removeInitial(a.to.node, a.to.port);
	        case 'startTransaction':
	          return null;
	        case 'endTransaction':
	          return null;
	        case 'changeProperties':
	          return this.graph.setProperties(a["new"]);
	        case 'addGroup':
	          return this.graph.addGroup(a.name, a.nodes, a.metadata);
	        case 'renameGroup':
	          return this.graph.renameGroup(a.oldName, a.newName);
	        case 'removeGroup':
	          return this.graph.removeGroup(a.name);
	        case 'changeGroup':
	          return this.graph.setGroupMetadata(a.name, calculateMeta(a.old, a["new"]));
	        case 'addInport':
	          return this.graph.addInport(a.name, a.port.process, a.port.port, a.port.metadata);
	        case 'removeInport':
	          return this.graph.removeInport(a.name);
	        case 'renameInport':
	          return this.graph.renameInport(a.oldId, a.newId);
	        case 'changeInport':
	          return this.graph.setInportMetadata(a.name, calculateMeta(a.old, a["new"]));
	        case 'addOutport':
	          return this.graph.addOutport(a.name, a.port.process, a.port.port, a.port.metadata(a.name));
	        case 'removeOutport':
	          return this.graph.removeOutport;
	        case 'renameOutport':
	          return this.graph.renameOutport(a.oldId, a.newId);
	        case 'changeOutport':
	          return this.graph.setOutportMetadata(a.name, calculateMeta(a.old, a["new"]));
	        default:
	          throw new Error("Unknown journal entry: " + entry.cmd);
	      }
	    };

	    Journal.prototype.executeEntryInversed = function(entry) {
	      var a;
	      a = entry.args;
	      switch (entry.cmd) {
	        case 'addNode':
	          return this.graph.removeNode(a.id);
	        case 'removeNode':
	          return this.graph.addNode(a.id, a.component);
	        case 'renameNode':
	          return this.graph.renameNode(a.newId, a.oldId);
	        case 'changeNode':
	          return this.graph.setNodeMetadata(a.id, calculateMeta(a["new"], a.old));
	        case 'addEdge':
	          return this.graph.removeEdge(a.from.node, a.from.port, a.to.node, a.to.port);
	        case 'removeEdge':
	          return this.graph.addEdge(a.from.node, a.from.port, a.to.node, a.to.port);
	        case 'changeEdge':
	          return this.graph.setEdgeMetadata(a.from.node, a.from.port, a.to.node, a.to.port, calculateMeta(a["new"], a.old));
	        case 'addInitial':
	          return this.graph.removeInitial(a.to.node, a.to.port);
	        case 'removeInitial':
	          return this.graph.addInitial(a.from.data, a.to.node, a.to.port);
	        case 'startTransaction':
	          return null;
	        case 'endTransaction':
	          return null;
	        case 'changeProperties':
	          return this.graph.setProperties(a.old);
	        case 'addGroup':
	          return this.graph.removeGroup(a.name);
	        case 'renameGroup':
	          return this.graph.renameGroup(a.newName, a.oldName);
	        case 'removeGroup':
	          return this.graph.addGroup(a.name, a.nodes, a.metadata);
	        case 'changeGroup':
	          return this.graph.setGroupMetadata(a.name, calculateMeta(a["new"], a.old));
	        case 'addInport':
	          return this.graph.removeInport(a.name);
	        case 'removeInport':
	          return this.graph.addInport(a.name, a.port.process, a.port.port, a.port.metadata);
	        case 'renameInport':
	          return this.graph.renameInport(a.newId, a.oldId);
	        case 'changeInport':
	          return this.graph.setInportMetadata(a.name, calculateMeta(a["new"], a.old));
	        case 'addOutport':
	          return this.graph.removeOutport(a.name);
	        case 'removeOutport':
	          return this.graph.addOutport(a.name, a.port.process, a.port.port, a.port.metadata);
	        case 'renameOutport':
	          return this.graph.renameOutport(a.newId, a.oldId);
	        case 'changeOutport':
	          return this.graph.setOutportMetadata(a.name, calculateMeta(a["new"], a.old));
	        default:
	          throw new Error("Unknown journal entry: " + entry.cmd);
	      }
	    };

	    Journal.prototype.moveToRevision = function(revId) {
	      var entries, entry, i, j, l, len, m, n, r, ref, ref1, ref2, ref3, ref4, ref5;
	      if (revId === this.currentRevision) {
	        return;
	      }
	      this.subscribed = false;
	      if (revId > this.currentRevision) {
	        for (r = j = ref = this.currentRevision + 1, ref1 = revId; ref <= ref1 ? j <= ref1 : j >= ref1; r = ref <= ref1 ? ++j : --j) {
	          ref2 = this.store.fetchTransaction(r);
	          for (l = 0, len = ref2.length; l < len; l++) {
	            entry = ref2[l];
	            this.executeEntry(entry);
	          }
	        }
	      } else {
	        for (r = m = ref3 = this.currentRevision, ref4 = revId + 1; m >= ref4; r = m += -1) {
	          entries = this.store.fetchTransaction(r);
	          for (i = n = ref5 = entries.length - 1; n >= 0; i = n += -1) {
	            this.executeEntryInversed(entries[i]);
	          }
	        }
	      }
	      this.currentRevision = revId;
	      return this.subscribed = true;
	    };

	    Journal.prototype.undo = function() {
	      if (!this.canUndo()) {
	        return;
	      }
	      return this.moveToRevision(this.currentRevision - 1);
	    };

	    Journal.prototype.canUndo = function() {
	      return this.currentRevision > 0;
	    };

	    Journal.prototype.redo = function() {
	      if (!this.canRedo()) {
	        return;
	      }
	      return this.moveToRevision(this.currentRevision + 1);
	    };

	    Journal.prototype.canRedo = function() {
	      return this.currentRevision < this.store.lastRevision;
	    };

	    Journal.prototype.toPrettyString = function(startRev, endRev) {
	      var e, entry, j, l, len, lines, r, ref, ref1;
	      startRev |= 0;
	      endRev |= this.store.lastRevision;
	      lines = [];
	      for (r = j = ref = startRev, ref1 = endRev; ref <= ref1 ? j < ref1 : j > ref1; r = ref <= ref1 ? ++j : --j) {
	        e = this.store.fetchTransaction(r);
	        for (l = 0, len = e.length; l < len; l++) {
	          entry = e[l];
	          lines.push(entryToPrettyString(entry));
	        }
	      }
	      return lines.join('\n');
	    };

	    Journal.prototype.toJSON = function(startRev, endRev) {
	      var entries, entry, j, l, len, r, ref, ref1, ref2;
	      startRev |= 0;
	      endRev |= this.store.lastRevision;
	      entries = [];
	      for (r = j = ref = startRev, ref1 = endRev; j < ref1; r = j += 1) {
	        ref2 = this.store.fetchTransaction(r);
	        for (l = 0, len = ref2.length; l < len; l++) {
	          entry = ref2[l];
	          entries.push(entryToPrettyString(entry));
	        }
	      }
	      return entries;
	    };

	    Journal.prototype.save = function(file, success) {
	      var json;
	      json = JSON.stringify(this.toJSON(), null, 4);
	      return __webpack_require__(11).writeFile(file + ".json", json, "utf-8", function(err, data) {
	        if (err) {
	          throw err;
	        }
	        return success(file);
	      });
	    };

	    return Journal;

	  })(EventEmitter);

	  exports.Journal = Journal;

	  exports.JournalStore = JournalStore;

	  exports.MemoryJournalStore = MemoryJournalStore;

	}).call(this);


/***/ }
/******/ ]);
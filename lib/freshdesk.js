/**
 * Created by Matthieu ANTOINE on 05/08/2016.
 */

var request = require('request');

class Freshdesk {
    constructor(url, apikey, headers = {}) {
        this.url = url;
        this.apikey = apikey;
        this.authKey = this.apikey + ":X";
        var buffer = new Buffer(this.authKey);
        this.authKey = buffer.toString('base64');
        var defaultHeaders = {
            'Authorization': "Basic " + this.authKey,
            'Content-Type': "application/json"
        };
        for (property in Object.keys(headers)) {
            if (!defaultHeaders.hasOwnProperty(property)) {
                defaultHeaders[property] = headers[property];
            }
        }
        this.r = request.defaults({
            headers: defaultHeaders
        });
    }

    get(path, cb) {
        return this.r.get({
            url: "" + this.url + path
        }, cb);
    };

    post(path, data, cb) {
        return this.r.post({
            url: "" + this.url + path,
            json: data
        }, cb);
    };

    put(path, data, cb) {
        return this.r.put({
            url: "" + this.url + path,
            json: data
        }, cb);
    };

    del(path, cb) {
        return this.r.del({
            url: "" + this.url + path
        }, cb);
    };

    createTicket(data, cb) {
        return this.post('/api/v2/tickets', data, cb);
    };

    listTickets(cb) {
        return this.get('/api/v2/tickets', cb);
    };

    allTickets(cb) {
        return this.listTicketsSince('1970-01-01T00:00:00Z', cb);
        /* Dirty hack to display all tickets. Freshdesk
        by default only displays tickets from the last 30 days.
        Therefore we have to use the updated_since filter.
        To be sure to display all tickets without demanding input from the user, we use the UNIX epoch */
    };

    listTicketsSince(date, cb){
        return this.get('/api/v2/tickets?updated_since=' + date, cb);
    }

    getTicket(id, cb) {
        return this.get('/api/v2/tickets' + id, cb);
    };

    updateTicket(id, data, cb) {
        return this.put('/api/v2/tickets' + id, data, cb);
    };

    //pickTicket(id, cb) {
    //    return this.put("/helpdesk/tickets/" + id + "/pick_tickets.json", {}, cb);
    //};

    deleteTicket(id, cb) {
        return this.del('/api/v2/tickets' + id, cb);
    };

    restoreTicket(id, cb) {
        return this.put('/api/v2/tickets' + id + '/restore', cb);
    };

    assignTicket(id, user_id, cb) {
        return this.put("/helpdesk/tickets/" + id + "/assign.json?responder_id=" + user_id, cb);
    };

    ticketFields(cb) {
        return this.get("/api/v2/ticket_fields", cb);
    };

    addNoteToTicket(id, note, is_private = false, cb) {
        var data = {
                body: note,
                "private": is_private
        };
        return this.post("/api/v2/tickets/" + id + "/notes", data, cb);
    };

    timeSpentOnTicket(id, cb){
        return this.get("/api/v2/tickets/" + id + "/time_entries", cb);
    }

    createUser(data,cb){
        return this.post('/api/v2/contacts', data,cb);
    };

    listUsers(cb){
        return this.get('/api/v2/contacts', cb);
    }

    updateUser(id,data, cb){
        return this.put("/api/v2/contacts/" + id, data, cb);
    };

    getUserByEmail(email_id, cb) {
        var email = encodeURIComponent(email_id);
        return this.get("/api/v2/contacts?email=" + email, function(err, res, body){
            var users = JSON.parse(body);
            if(users.length !== 0){
                return cb(users[0]);
            }
            return cb(null);
        });
    };
}

module.exports = Freshdesk;
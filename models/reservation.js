/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this._customerId = customerId;
    this._numGuests = numGuests;
    this._startAt = startAt;
    this.notes = notes || "";
  }

  // get/set for customerId
  get customerId() {
    return this._customerId;
  }

  set customerId(val) {
    if (this._customerId !== undefined) {
      throw new Error("Cannot reassign customerId once set");
    }
    this._customerId = val;
  }

  // get/set for startAt
  get startAt() {
    return this._startAt;
  }

  set startAt(val) {
    if (!(val instanceof Date)) {
      throw new Error ("startAt must be a Date object");
    }
    this._startAt = val;
  }

  // get/set for numGuests
  get numGuests() {
    return this._numGuests;
  }

  set numGuests(val) {
    if (val < 1) {
      throw new Error("Number of guests must be at least 1");
    } 
    this._numGuests = val;
  }

  // get/set notes
  get notes() {
    return this._notes;
  } 

  set notes(val) {
    this._notes = val || "";
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  /** Save this reservation. */
  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.numGuests, this.startAt, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET customer_id=$1, num_guests=$2, start_at=$3, notes=$4
             WHERE id=$5`,
        [this.customerId, this.numGuests, this.startAt, this.notes, this.id]
      );
    }
  }
}

module.exports = Reservation;

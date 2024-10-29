/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes, reservationCount = 0 }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this._notes = notes || "";
    this.reservationCount = reservationCount;
  }

  /** getter for fullName */
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /** get/set phone number. */
  set phone(val) {
    this._phone = val || null;
  }

  get phone() {
    return this._phone;
  }


  /** get/set notes. */
  set notes(val) {
    this._notes = val || "";
  }

  get notes() {
    return this._notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }

  /** Returns customer's full name. */
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /** Search for customers by name. */
  static async searchByName(name) {
    const results = await db.query(
      `SELECT id,
              first_name AS "firstName",
              last_name AS "lastName",
              phone,
              notes
      FROM customers
      WHERE CONCAT(first_name, ' ', last_name) ILIKE $1`, 
      [`%${name}%`]
    );
    return results.rows.map(c => new Customer(c));
  }

  /** Show top 10 customers ordered by most reservations */
  static async getBestCustomers () {
    const results = await db.query(
      `SELECT customers.id,
              customers.first_name AS "firstName",
              customers.last_name AS "lastName",
              customers.phone,
              customers.notes,
              COUNT(reservations.id) AS "reservationCount"
      FROM customers
      LEFT JOIN reservations ON customers.id = reservations.customer_id
      GROUP BY customers.id
      ORDER BY "reservationCount" DESC
      LIMIT 10`
    );
    console.log("Best Customers Data:", results.rows);

    return results.rows.map(c => {
      console.log("Mapping row:", c);
      return new Customer({ ...c, reservationCount: c.reservationCount });
  });
}
}

module.exports = Customer;

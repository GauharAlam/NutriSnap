/**
 * Reusable pagination helper for MongoDB queries.
 * @param {import("mongoose").Model} model
 * @param {object} filter - MongoDB query filter
 * @param {object} options - { page, limit, sort }
 * @returns {Promise<{docs: Array, pagination: object}>}
 */
export async function paginate(model, filter, { page = 1, limit = 20, sort = { createdAt: -1 } } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  const [docs, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(l).lean(),
    model.countDocuments(filter),
  ]);

  return {
    docs,
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l),
      hasNext: p * l < total,
      hasPrev: p > 1,
    },
  };
}

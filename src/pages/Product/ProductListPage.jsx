import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Row,
  Col,
  Select,
  Input,
  Slider,
  Checkbox,
  Spin,
  Empty,
  Pagination,
  Typography,
  Drawer,
  Button,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { productsAPI, categoriesAPI } from "../../api/services";
import ProductCard from "../../components/product/ProductCard";

const { Title, Text } = Typography;

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    ordering: searchParams.get("ordering") || "-created_at",
    in_stock: searchParams.get("in_stock") || "",
    page: Number(searchParams.get("page")) || 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.ordering) params.ordering = filters.ordering;
      if (filters.in_stock) params.in_stock = filters.in_stock;
      params.page = filters.page;

      const res = await productsAPI.getAll(params);
      setProducts(res.data.results || []);
      setTotal(res.data.count || 0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
    // Sync to URL
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    setSearchParams(params);
  }, [filters, fetchProducts]);

  useEffect(() => {
    categoriesAPI.getAll().then((res) => setCategories(res.data.data || []));
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const FilterPanel = () => (
    <div className="flex flex-col gap-4">
      <div>
        <Text strong className="block mb-2">
          الفئة
        </Text>
        <Select
          placeholder="كل الفئات"
          allowClear
          style={{ width: "100%" }}
          value={filters.category || undefined}
          onChange={(v) => updateFilter("category", v || "")}
          options={[
            { value: "", label: "كل الفئات" },
            ...categories.map((c) => ({ value: String(c.id), label: c.name })),
          ]}
        />
      </div>
      <div>
        <Checkbox
          checked={filters.in_stock === "true"}
          onChange={(e) =>
            updateFilter("in_stock", e.target.checked ? "true" : "")
          }
        >
          متاح فقط
        </Checkbox>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Title level={3} style={{ margin: 0 }}>
          المنتجات
        </Title>
        <Text type="secondary">{total} منتج</Text>
      </div>

      {/* Search + Sort Bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Input.Search
          placeholder="ابحث عن منتج..."
          defaultValue={filters.search}
          onSearch={(v) => updateFilter("search", v)}
          allowClear
          style={{ flex: 1, minWidth: 200 }}
        />
        <Select
          value={filters.ordering}
          onChange={(v) => updateFilter("ordering", v)}
          style={{ width: 160 }}
          options={[
            { value: "-created_at", label: "الأحدث أولاً" },
            { value: "price", label: "السعر: الأقل" },
            { value: "-price", label: "السعر: الأعلى" },
          ]}
        />
        <Button
          icon={<FilterOutlined />}
          onClick={() => setFilterOpen(true)}
          className="md:hidden"
        >
          فلتر
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* Sidebar Filters - Desktop */}
        <Col xs={0} md={6} className="hidden md:block">
          <div className="bg-white rounded-xl p-5 border border-slate-100 sticky top-20">
            <Title level={5} className="mb-4">
              الفلاتر
            </Title>
            <FilterPanel />
          </div>
        </Col>

        {/* Products Grid */}
        <Col xs={24} md={18}>
          {loading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : products.length === 0 ? (
            <Empty description="لا توجد منتجات" />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {products.map((product) => (
                  <Col key={product.id} xs={12} sm={8} lg={8}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
              {total > 12 && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    current={filters.page}
                    total={total}
                    pageSize={12}
                    onChange={(page) => setFilters((p) => ({ ...p, page }))}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      {/* Mobile Filter Drawer */}
      <Drawer
        title="الفلاتر"
        placement="right"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        width={280}
      >
        <FilterPanel />
        <Button
          type="primary"
          block
          className="mt-6"
          onClick={() => setFilterOpen(false)}
        >
          تطبيق
        </Button>
      </Drawer>
    </div>
  );
};

export default ProductListPage;

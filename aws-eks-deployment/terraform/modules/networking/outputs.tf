resource "output" "vpc_id" {
  value = aws_vpc.main.id
}

resource "output" "public_subnet_ids" {
  value = aws_subnet.public.*.id
}

resource "output" "private_subnet_ids" {
  value = aws_subnet.private.*.id
}

resource "output" "nat_gateway_id" {
  value = aws_nat_gateway.main.id
}

resource "output" "route_table_id" {
  value = aws_route_table.main.id
}
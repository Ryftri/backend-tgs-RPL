import OutGoods from "../models/OutGoodsModels.js";
import Products from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import {Op} from "sequelize";

export const getOutGoods = async (req, res) =>{
    try {
        let response;
        if(req.role === "admin"){
            response = await OutGoods.findAll({
                attributes:['uuid', 'kode_brg_keluar', 'quantity', 'createdAt', 'updatedAt'],
                include:[
                    {
                        model: User, 
                        attributes:['name','email']
                    },
                    {
                        model: Products, 
                        attributes:['name', 'typeProduct', 'brand']
                    }
                ]
            });
        }else{
            response = await OutGoods.findAll({
                attributes:['uuid', 'kode_brg_keluar', 'quantity', 'createdAt', 'updatedAt'],
                where:{
                    userId: req.userId
                },
                include:[
                    {
                        model: User, 
                        attributes:['name','email']
                    },
                    {
                        model: Products, 
                        attributes:['name', 'typeProduct', 'brand']
                    }
                ]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getOutGoodsById = async(req, res) =>{
    try {
        const outGoods = await OutGoods.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!outGoods) return res.status(404).json({msg: "Data tidak ditemukan"});
        let response;
        if(req.role === "admin"){
            response = await OutGoods.findOne({
                attributes:['uuid', 'kode_brg_keluar', 'quantity', 'createdAt', 'updatedAt'],
                where:{
                    id: OutGoods.id
                },
                include:[
                    {
                        model: User, 
                        attributes:['name','email']
                    },
                    {
                        model: Products, 
                        attributes:['name', 'typeProduct', 'brand']
                    }
                ]
            });
        }else{
            response = await OutGoods.findOne({
                attributes:['uuid', 'kode_brg_keluar', 'quantity', 'createdAt', 'updatedAt'],
                where:{
                    [Op.and]:[{id: OutGoods.id}, {userId: req.userId}]
                },
                include:[
                    {
                        model: User, 
                        attributes:['name','email']
                    },
                    {
                        model: Products, 
                        attributes:['name', 'typeProduct', 'brand']
                    }
                ]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const createOutGoods = async(req, res) =>{
    const quantity = req.body.quantites;
    const uuid = req.body.id;

    const product = await Products.findOne({
        where: {
            uuid: uuid
        }
    });
    if(!product) return res.status(404).json({msg: "Data produk tidak ditemukan!"})
    if(!Number(product.quantity)) return res.status(400).json({msg: "Jumlah barang : " + product.quantity})
    if(Number(product.quantity) < quantity) return res.status(400).json({msg: "Jumlah melebihi kapasitas : " + product.quantity + "<" + quantity})

    const amount = Number(product.quantity) - Number(quantity);

    try {
        await OutGoods.create({
            quantity: quantity,
            userId: req.userId,
            productId: product.id
        });
        await Products.update({quantity: amount},{
            where: {
                uuid: product.uuid
            }
        });
        res.status(201).json({msg: "Barang masuk berhasil ditambahkan"})
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const updateOutGoods = async(req, res) =>{
    const outGoods = await OutGoods.findOne({
        where:{
            uuid: req.params.id
        }
    });
    if(!outGoods) return res.status(404).json({msg: "Data tidak ditemukan"});
    
    const name = req.body.title;
    const typeProduct = req.body.type;
    const brand = req.body.brand;
    const quantity = req.body.quantites;

    try {
        if(req.role === "admin"){
            await OutGoods.update({name, typeProduct, brand, quantity},{
                where:{
                    id: OutGoods.id
                }
            });
        }else{
            if(req.userId !== OutGoods.userId) return res.status(403).json({msg: "Akses terlarang"});
            await OutGoods.update({name, typeProduct, brand, quantity},{
                where:{
                    [Op.and]:[{id: OutGoods.id}, {userId: req.userId}]
                }
            });
        }
        res.status(200).json({msg: "Barang masuk berhasil diperbarui"});
    } catch (error) {
        res.status(500).json({msg: "Pastikan semua data terisi dengan benar dan tidak ada yang kosong. Mohon periksa kembali!"});
    }
}

export const deleteOutGoods = async(req, res) =>{
    try {
        const outGoods = await OutGoods.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!outGoods) return res.status(404).json({msg: "Data tidak ditemukan"});

        const product = await Products.findOne({
            where: {
                id: outGoods.productId
            }
        })
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});
        const total = Number(product.quantity) + Number(outGoods.quantity);

        if(req.role === "admin"){
            await OutGoods.destroy({
                where:{
                    id: outGoods.id
                }
            });
        }else{
            if(req.userId !== outGoods.userId) return res.status(403).json({msg: "Akses terlarang"});
            await OutGoods.destroy({
                where:{
                    [Op.and]:[{id: outGoods.id}, {userId: req.userId}]
                }
            });
        }

        await Products.update({quantity: total}, {
            where: {
                uuid: product.uuid
            }
        })

        res.status(200).json({msg: "Barang masuk berhasil dihapus"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}
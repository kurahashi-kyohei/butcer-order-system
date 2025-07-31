import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // 更新データのバリデーション
    const updateData: {
      name?: string
      description?: string | null
      basePrice?: number
      unit?: string
      imageUrl?: string | null
      hasStock?: boolean
      isActive?: boolean
      usageOptionIds?: string | null
      flavorOptionIds?: string | null
      quantityMethods?: string
      hasRemarks?: boolean
      priority?: number
    } = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description || null
    if (data.basePrice !== undefined) updateData.basePrice = parseInt(data.basePrice)
    if (data.unit !== undefined) updateData.unit = data.unit
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null
    if (data.hasStock !== undefined) updateData.hasStock = data.hasStock
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    
    // オプションIDの配列をカンマ区切りの文字列に変換
    if (data.usageOptionIds !== undefined) {
      updateData.usageOptionIds = data.usageOptionIds && Array.isArray(data.usageOptionIds) 
        ? data.usageOptionIds.join(',') 
        : null
    }
    if (data.flavorOptionIds !== undefined) {
      updateData.flavorOptionIds = data.flavorOptionIds && Array.isArray(data.flavorOptionIds) 
        ? data.flavorOptionIds.join(',') 
        : null
    }
    if (data.quantityMethods !== undefined) updateData.quantityMethods = data.quantityMethods
    if (data.hasRemarks !== undefined) updateData.hasRemarks = data.hasRemarks
    if (data.priority !== undefined) updateData.priority = parseInt(data.priority)
    
    // カテゴリの更新処理
    let updatedProduct
    if (data.categoryId !== undefined) {
      // 現在のカテゴリを取得
      const currentProduct = await prisma.product.findUnique({
        where: { id },
        include: {
          categories: {
            include: {
              category: true
            }
          }
        }
      })
      
      const currentCategoryId = currentProduct?.categories?.[0]?.categoryId
      
      // カテゴリが実際に変更された場合のみ更新処理を実行
      if (currentCategoryId !== data.categoryId) {
        // カテゴリの存在確認
        const categoryExists = await prisma.category.findUnique({
          where: { id: data.categoryId }
        })
        
        if (!categoryExists) {
          return NextResponse.json(
            { error: '指定されたカテゴリが存在しません' },
            { status: 400 }
          )
        }
        
        // 既存のカテゴリ関係を削除して新しいものを作成
        await prisma.productCategory.deleteMany({
          where: { productId: id }
        })
        
        updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            ...updateData,
            categories: {
              create: {
                categoryId: data.categoryId
              }
            }
          },
          include: {
            categories: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          }
        })
      } else {
        // カテゴリが変更されていない場合は通常の更新
        updatedProduct = await prisma.product.update({
          where: { id },
          data: updateData,
          include: {
            categories: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          }
        })
      }
    } else {
      // カテゴリの変更がない場合は通常の更新
      updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        }
      })
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 商品の存在確認
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    // 論理削除: isActiveをfalseに設定
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { 
        isActive: false,
        hasStock: false // 在庫もなしに設定
      }
    })

    return NextResponse.json({ 
      message: '商品を削除しました（非表示にしました）',
      product: updatedProduct
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}